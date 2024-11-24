const argon2 = require('argon2');

// Hash the password using Argon2
argon2.hash('securepassword') // Replace 'securepassword' with your password
  .then(hashedPassword => console.log('Hashed password:', hashedPassword))
  .catch(err => console.error('Error hashing password:', err));
