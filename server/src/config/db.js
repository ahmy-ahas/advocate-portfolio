import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function createMemoryMongo() {
  const memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  process.env.MONGODB_URI = uri;
  return uri;
}

export async function connectDB(uri = process.env.MONGODB_URI) {
  mongoose.set('strictQuery', true);

  const attemptConnect = async (connectionUri) => {
    await mongoose.connect(connectionUri, { serverSelectionTimeoutMS: 15000 });
    console.log(`MongoDB connected to ${connectionUri}`);
  };

  try {
    if (!uri) {
      const memoryUri = await createMemoryMongo();
      await attemptConnect(memoryUri);
      return;
    }

    await attemptConnect(uri);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    const memoryUri = await createMemoryMongo();
    console.warn(`MongoDB connection failed (${error.message}). Falling back to an in-memory MongoDB instance at ${memoryUri}.`);
    await attemptConnect(memoryUri);
  }
}
