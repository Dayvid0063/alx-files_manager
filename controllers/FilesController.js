import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { decodeBase64, validateFileType, checkParentId } from '../utils/helpers';
import dbClient from '../utils/db';

class FilesController {
  // eslint-disable-next-line consistent-return
  static async postUpload(req, res) {
    const {
      name, type, isPublic = false, parentId = 0, data,
    } = req.body;
    const { user } = req;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !validateFileType(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    const parentCheck = await checkParentId(parentId);
    if (parentId && !parentCheck.exists) return res.status(400).json({ error: 'Parent not found' });
    if (parentCheck.exists && parentCheck.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });

    const file = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = uuidv4();
      const localPath = path.join(folderPath, fileName);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      fs.writeFileSync(localPath, decodeBase64(data));
      file.localPath = localPath;
    }

    const result = await dbClient.db.collection('files').insertOne(file);

    res.status(201).json({
      id: result.insertedId,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
      localPath: file.localPath || null,
    });
  }
}

export default FilesController;
