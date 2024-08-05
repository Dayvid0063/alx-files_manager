import app from './app';
import Load from './utils/dotenv';

Load();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
