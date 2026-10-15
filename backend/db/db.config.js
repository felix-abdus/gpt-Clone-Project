import mysql2 from "mysql2/promise";
// import dotenv from "dotenv"
// dotenv.config()
import "dotenv/config";
import fs from 'fs'

const db = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "gpt-admin",
  password: process.env.DB_PASSWORD || "EP6265076@jan02",
  database: process.env.DB_DATABASE || "gpt-clone",
  port: process.env.DB_PORT || 3444,
  ssl:{
    ca: fs.readFileSync(process.env.CA)
  }


});


// console.log(
//     {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password:process.env.DB_PASSWORD,
//     database:process.env.DB_DATABASE
// }
//)
export default db;
