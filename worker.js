/* eslint-disable no-unused-vars */
import Bull from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import path from 'path';
import dbClient from './utils/db';
import { handleError, errorMessages } from './helper/errorHandler';

// Create a Bull queue for file processing
const fileQueue = new Bull('fileQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  // Validate job data
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  // Find the file document in the database
  const fileDocument = await dbClient.db.collection('files').findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!fileDocument) {
    throw new Error('File not found');
  }

  const filePath = fileDocument.localPath;

  const sizes = [500, 250, 100];
  for (const size of sizes) {
    try {
      const options = { width: size };
      // eslint-disable-next-line no-await-in-loop
      const thumbnail = await imageThumbnail(filePath, options);
      const thumbnailPath = filePath.replace(/(\.[^.]*)$/, `_${size}$1`);
      fs.writeFileSync(thumbnailPath, thumbnail);
    } catch (error) {
      console.error(`Error generating thumbnail for size ${size}:`, error);
    }
  }
});

export default fileQueue;
