const {Pool} = require('pg');
const pool = new Pool({
    host: 'localhost',
    user: 'database-user',
    port: 5000, 
    database: 'test'
});

module.exports = pool;