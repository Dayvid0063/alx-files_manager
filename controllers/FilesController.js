import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { generateFilePath, saveFile } from '../helper/fileHelper';
import { handleError, errorMessages } from '../helper/errorHandler';

export default class FilesController {
  static async postUpload(req, res) {
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    // Validate inputs
    if (!name) {
      return handleError(res, 400, errorMessages.missingName);
    }
    if (!['folder', 'file', 'image'].includes(type)) {
      return handleError(res, 400, errorMessages.missingType);
    }
    if (type !== 'folder' && !data) {
      return handleError(res, 400, errorMessages.missingData);
    }

    let parentFile = null;
    if (parentId) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return handleError(res, 400, errorMessages.parentNotFound);
      }
      if (parentFile.type !== 'folder') {
        return handleError(res, 400, errorMessages.parentNotFolder);
      }
    }

    const fileDocument = {
      userId: req.user._id,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: '',
    };

    if (type === 'file' || type === 'image') {
      const filePath = generateFilePath(name);
      saveFile(filePath, data);
      fileDocument.localPath = filePath;
    }

    try {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      return res.status(201).json({ id: result.insertedId, ...fileDocument });
    } catch (error) {
      return res.status(500).json({ error: 'Error saving the file' });
    }
  }

  static async getShow(req, res) {
    const { id } = req.params;

    try {
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id), userId: req.user._id });

      if (!file) {
        return handleError(res, 404, 'Not found');
      }

      return res.status(200).json(file);
    } catch (error) {
      return handleError(res, 500, 'Error retrieving the file');
    }
  }

  static async getIndex(req, res) {
    const { parentId = '0', page = 0 } = req.query;
    const limit = 20;
    const skip = parseInt(page, 10) * limit;

    try {
      const files = await dbClient.db.collection('files').aggregate([
        { $match: { userId: req.user._id, parentId } },
        { $skip: skip },
        { $limit: limit },
      ]).toArray();

      return res.status(200).json(files);
    } catch (error) {
      return handleError(res, 500, 'Error retrieving files');
    }
  }
}
