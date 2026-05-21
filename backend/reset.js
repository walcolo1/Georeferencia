const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

bcrypt.hash('123456', 10)
  .then(h => pool.query('UPDATE users SET password = ? WHERE email = ?', [h, 'admin@test.com']))
  .then(() => console.log('Password reset to 123456'))
  .catch(console.error)
  .finally(() => process.exit());
