import mysql2 from "mysql2/promise"
// import dotenv from "dotenv"
// dotenv.config()
import 'dotenv/config'

const db= mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    port: process.env.DB_PORT
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