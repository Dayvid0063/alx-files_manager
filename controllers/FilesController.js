/* eslint-disable no-trailing-spaces */
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import verifyToken from '../middleware/VerifyToken';

export default class FilesController {
  static async postUpload(req, res) {
    try {
      // Retrieve and verify the user based on the token
      const token = req.headers.authorization.split(' ')[1];
      const user = verifyToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      // Validation checks
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      const acceptedTypes = ['folder', 'file', 'image'];
      if (!type || !acceptedTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      const db = await dbClient();
      if (parentId) {
        const parentFile = await db
          .collection('files')
          .findOne({ _id: parentId });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Creating the file document
      const fileDoc = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
        createdAt: new Date(),
      };

      if (type === 'folder') {
        // Insert folder document into DB
        const result = await db.collection('files').insertOne(fileDoc);
        return res.status(201).json(result.ops[0]);
      }

      // Handling file/image storage
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filename = uuidv4();
      const localPath = path.join(folderPath, filename);

      // Store the file in clear (data contains the Base64 of the file)
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

      fileDoc.localPath = localPath;

      // Insert file document into DB
      const result = await db.collection('files').insertOne(fileDoc);
      return res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
