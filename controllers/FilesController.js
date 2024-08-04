/* eslint-disable consistent-return */
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Bull from 'bull';
// eslint-disable-next-line no-unused-vars
import thumbnail from 'image-thumbnail';
import mime from 'mime-types';
import Auth from '../authentication/authentication';
import dbClient from '../utils/db';
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../middlewares/errorHandler';

// Create Bull queue
const fileQueue = new Bull('fileQueue', 'redis://127.0.0.1:6379');

export default class FilesController {
  static async postUpload(req, res, next) {
    try {
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      if (!userId) {
        throw new UnauthorizedError();
      }

      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      // Validation checks
      if (!name) {
        throw new BadRequestError('Missing name');
      }

      const validTypes = ['folder', 'file', 'image'];
      if (!type || !validTypes.includes(type)) {
        throw new BadRequestError('Invalid type');
      }

      if (type !== 'folder' && !data) {
        throw new BadRequestError('Missing data');
      }

      // Check for parentId validity
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(parentId) });
        if (!parentFile) {
          throw new BadRequestError('Parent not found');
        }
        if (parentFile.type !== 'folder') {
          throw new BadRequestError('Parent is not a folder');
        }
      }

      const fileDocument = {
        userId: dbClient.getObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : dbClient.getObjectId(parentId),
      };

      // Handle folder creation
      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        return res.status(201).json({
          id: result.insertedId,
          userId: fileDocument.userId,
          name,
          type,
          isPublic,
          parentId,
        });
      }

      // Handle file or image creation
      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      const filePath = path.join(FOLDER_PATH, uuidv4());
      const fileData = Buffer.from(data, 'base64');

      try {
        fs.writeFileSync(filePath, fileData);

        fileDocument.localPath = filePath;

        const result = await dbClient.db.collection('files').insertOne(fileDocument);

        // Add job to queue for generating thumbnails if the type is image
        if (type === 'image') {
          await fileQueue.add({ userId: fileDocument.userId, fileId: result.insertedId });
        }

        return res.status(201).json({
          id: result.insertedId,
          userId: fileDocument.userId,
          name,
          type,
          isPublic,
          parentId,
          localPath: filePath,
        });
      } catch (error) {
        throw new InternalServerError('Error saving the file');
      }
    } catch (error) {
      next(error);
    }
  }

  static async putPublish(req, res, next) {
    try {
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      if (!userId) {
        throw new UnauthorizedError();
      }

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(fileId), userId: dbClient.getObjectId(userId) });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      const updateResult = await dbClient.db.collection('files').updateOne(
        { _id: dbClient.getObjectId(fileId) },
        { $set: { isPublic: true } },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundError('File not found');
      }

      return res.status(200).json({
        id: fileId,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
      });
    } catch (error) {
      next(error);
    }
  }

  static async putUnpublish(req, res, next) {
    try {
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      if (!userId) {
        throw new UnauthorizedError();
      }

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(fileId), userId: dbClient.getObjectId(userId) });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      const updateResult = await dbClient.db.collection('files').updateOne(
        { _id: dbClient.getObjectId(fileId) },
        { $set: { isPublic: false } },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundError('File not found');
      }

      return res.status(200).json({
        id: fileId,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFile(req, res, next) {
    try {
      const fileId = req.params.id;
      const size = parseInt(req.query.size, 10);
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      const file = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(fileId) });

      if (!file) {
        throw new NotFoundError();
      }

      if (!file.isPublic && (!userId || !file.userId.equals(dbClient.getObjectId(userId)))) {
        throw new NotFoundError();
      }

      if (file.type === 'folder') {
        throw new BadRequestError("A folder doesn't have content");
      }

      let filePath = file.localPath;
      if (file.type === 'image' && size) {
        const validSizes = [500, 250, 100];
        if (!validSizes.includes(size)) {
          throw new BadRequestError('Invalid size');
        }

        filePath = path.join(path.dirname(file.localPath), `${path.basename(file.localPath, path.extname(file.localPath))}_${size}${path.extname(file.localPath)}`);
        if (!fs.existsSync(filePath)) {
          throw new NotFoundError();
        }
      }

      const mimeType = mime.lookup(file.name);
      const fileContent = fs.readFileSync(filePath);

      res.set('Content-Type', mimeType);
      return res.send(fileContent);
    } catch (error) {
      next(error);
    }
  }

  // New Methods

  static async getIndex(req, res, next) {
    try {
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      if (!userId) {
        throw new UnauthorizedError();
      }

      const files = await dbClient.db.collection('files').find({ userId: dbClient.getObjectId(userId) }).toArray();

      return res.status(200).json(files);
    } catch (error) {
      next(error);
    }
  }

  static async getShow(req, res, next) {
    try {
      const fileId = req.params.id;
      const token = req.header('X-Token');
      const userId = await Auth.getUserIdByToken(token);

      const file = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(fileId) });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      if (!file.isPublic && (!userId || !file.userId.equals(dbClient.getObjectId(userId)))) {
        throw new NotFoundError();
      }

      return res.status(200).json({
        id: file._id,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        localPath: file.localPath,
      });
    } catch (error) {
      next(error);
    }
  }
}
