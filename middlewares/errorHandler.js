// eslint-disable-next-line import/prefer-default-export
export const errorHandler = (err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};
