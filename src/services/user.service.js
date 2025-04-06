const User = require('../models/user');
const bcrypt = require('bcrypt'); // For password hashing

async function findById(id) {
  return User.findOne({
    where: { id },
  });
}

// Register a new user
async function registerUser({ username, email, password }) {
  // Check if the user already exists
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user record in the database
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return user; // Return the newly created user
}

module.exports = {
  findById,
  registerUser, // Export the registerUser function
};
