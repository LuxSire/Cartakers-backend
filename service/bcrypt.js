
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds, you can adjust this as needed

// Hash a password
async function hashPassword(password, salt) {
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}


// Generate a random salt
async function generateSalt() {
  const salt = await bcrypt.genSalt(saltRounds);
  return salt;
}


// Verify a password
async function verifyPassword(inputPassword, hashedPassword) {
  const match = await bcrypt.compare(inputPassword, hashedPassword);
  return match;
}


module.exports = {
    hashPassword: hashPassword,
    verifyPassword: verifyPassword,
    generateSalt:generateSalt,
};