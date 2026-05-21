const pool = require('./backend/src/config/db');

pool.query("SELECT id, name, email, password FROM users WHERE email='admin@test.com'")
  .then(([rows]) => {
    console.log(rows);
  })
  .catch(console.error)
  .finally(() => process.exit());
