import { Buffer } from 'buffer';
import dbClient from './db';

// eslint-disable-next-line arrow-body-style
export const decodeBase64 = (data) => {
  return Buffer.from(data, 'base64');
};

export const validateFileType = (type) => {
  const validTypes = ['folder', 'file', 'image'];
  return validTypes.includes(type);
};

export const checkParentId = async (parentId) => {
  if (parentId === 0) return { exists: true, type: 'folder' };

  const file = await dbClient.db.collection('files').findOne({ _id: parentId });

  return {
    exists: !!file,
    type: file && file.type ? file.type : null,
  };
};
