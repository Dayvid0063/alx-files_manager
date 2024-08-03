import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Auth from '../authentication/authentication';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');

    // Retrieve the user based on the token
    const userId = await Auth.getUserIdByToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validation checks
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check for parentId validity
    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
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
      return res.status(500).json({ error: 'Error saving the file' });
    }
  }
}
