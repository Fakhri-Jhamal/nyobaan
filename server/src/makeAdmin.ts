import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

async function makeAdmin() {
  const username = process.argv[2];
  
  if (!username) {
    console.error('Please provide a username: npx ts-node src/makeAdmin.ts <username>');
    process.exit(1);
  }

  try {
    const uri = process.env.MONGODB_URI as string;
    await mongoose.connect(uri);
    
    const user = await User.findOneAndUpdate(
      { username: username }, 
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Success! User '${username}' is now an admin.`);
    } else {
      console.log(`Error: User '${username}' not found.`);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

makeAdmin();
