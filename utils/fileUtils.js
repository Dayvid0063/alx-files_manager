import fs from 'fs';
import path from 'path';
import { FOLDER_PATH } from '../config/config';

// eslint-disable-next-line import/prefer-default-export
export const saveFileToDisk = (filename, data) => {
  const filePath = path.join(FOLDER_PATH, filename);
  if (!fs.existsSync(FOLDER_PATH)) {
    fs.mkdirSync(FOLDER_PATH, { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  return filePath;
};
