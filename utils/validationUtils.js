// eslint-disable-next-line import/prefer-default-export
export const validateFileData = ({ name, type, data }) => {
  if (!name) return 'Missing name';
  if (!['file', 'folder', 'image'].includes(type)) return 'Missing type';
  if (type !== 'folder' && !data) return 'Missing data';
  return null;
};
