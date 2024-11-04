//*Connect to MongoDB by mongoose

import mongoose from 'mongoose';
import colors from 'colors';
import {exit} from 'node:process';
export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.DATABASE_URL);

    const url = `${connection.host}:${connection.port}`;
    console.log(
      colors.cyan.bold(`MongoDB connected in :${colors.blue.bold(url)}`)
    );
  } catch (error) {
    console.log(colors.red.bold('MongoDB connection failed'));
    exit(1);
  }
};
