import { ObjectId } from 'mongodb';
import { saveFileToDisk } from '../utils/fileUtils';
import { createFileDocument } from '../utils/dbUtils';

class FilesController {
  static async postUpload(req, res) {
    try {
      const {
        name, type, isPublic = false, data, parentId = '0',
      } = req.body;
      const userId = req.user._id;

      // Handle folder creation
      if (type === 'folder') {
        const fileDocument = {
          userId, name, type, isPublic, parentId,
        };
        await createFileDocument(req.db, fileDocument);
        return res.status(201).json(fileDocument);
      }

      // Handle file/image creation.
      const filename = `${new ObjectId()}`;
      const localPath = saveFileToDisk(filename, data);

      const fileDocument = {
        userId, name, type, isPublic, parentId, localPath,
      };
      await createFileDocument(req.db, fileDocument);
      return res.status(201).json(fileDocument);
    } catch (error) {
      return res.status(500).json({ error: 'Error saving file' });
    }
  }
}

export default FilesController;
