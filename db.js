// db.js
import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',          // ✅ make sure this is correct
  password: '@1Shamir', // ✅ replace with your MySQL password
  database: 'om_logistics' // ✅ replace with your DB name
});

export default db;
