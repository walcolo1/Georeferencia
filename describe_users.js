const pool = require('./backend/src/config/db');

pool.query('DESCRIBE users')
  .then(([rows]) => {
    console.log(rows);
  })
  .catch(console.error)
  .finally(() => process.exit());
