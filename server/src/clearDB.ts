import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearDB() {
  try {
    const uri = process.env.MONGODB_URI as string;
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearDB();
