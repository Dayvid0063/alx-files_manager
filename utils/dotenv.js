import { existsSync, readFileSync } from 'fs';

const Load = () => {
  // Determine which environment file to load
  const env = process.env.npm_lifecycle_event || 'dev';
  const envPath = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(envPath)) {
    const fileData = readFileSync(envPath, 'utf-8').trim().split('\n');

    // Loop through each line in the environment file
    for (const line of fileData) {
      const sepIndex = line.indexOf('=');

      // Extract the variable name and its value
      const n = line.substring(0, sepIndex);
      const val = line.substring(sepIndex + 1);

      process.env[n] = val;
    }
  } else {
    console.warn(`Environment file ${envPath} not found.`);
  }
};

export default Load;
