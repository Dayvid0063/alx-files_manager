import { validateFileData } from '../utils/validationUtils';

// eslint-disable-next-line import/prefer-default-export, consistent-return
export const validationMiddleware = (req, res, next) => {
  const {
    name, type, data, parentId,
  } = req.body;

  const error = validateFileData({
    name, type, data, parentId,
  });
  if (error) {
    return res.status(400).json({ error });
  }

  next();
};
