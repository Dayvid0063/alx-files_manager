import { existsSync, readFileSync } from 'fs';

const Load = () => {
  const env = process.env.NODE_ENV || 'dev';
  const envPath = env.includes('test') ? '.env.test' : '.env';

  if (existsSync(envPath)) {
    const fileData = readFileSync(envPath, 'utf-8').trim().split('\n');
    fileData.forEach((line) => {
      const [key, value] = line.split('=');
      process.env[key] = value;
    });
  } else {
    console.warn(`Environment file ${envPath} not found.`);
  }
};

export default Load;
