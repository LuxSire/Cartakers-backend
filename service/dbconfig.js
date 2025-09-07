require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

// Read SSL certificate
const serverCa = [fs.readFileSync("DigiCertGlobalRootCA.crt.pem", "utf8")];

// Configuration for MySQL connection pool with SSL and UTF-8 support
const config = {
    user: process.env['DB_USER'],
    password: process.env['DB_PASS'],
    host: process.env['DB_SERVER'],
    database: process.env['DB_DATABASE'],
    charset: "utf8mb4",
    connectionLimit: 100, // Adjusted to a reasonable limit for performance
    port: 3306,
    ssl: {
        rejectUnauthorized: true,
     //  ca: serverCa
    }
};

// Create a single MySQL connection pool
const pool = mysql.createPool(config);

pool.getConnection().catch(err => {
  console.error('DB connect error:', err.code, err.message);
});


// Export the pool for use in other modules
module.exports = pool;
