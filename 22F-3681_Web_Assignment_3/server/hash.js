const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Adjust the path to your User model
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function hashPasswords() {
  try {
    const users = await User.find();

    for (const user of users) {
      if (user.password && !user.password.startsWith('$2b$')) { // Check if already hashed
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Hashed password for user ${user.username}`);
      } else {
          console.log(`Password for user ${user.username} is already hashed or missing.`);
      }
    }

    console.log('All passwords hashed successfully.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error hashing passwords:', error);
    mongoose.disconnect();
  }
}

hashPasswords();