import mysql from 'mysql2/promise';
import 'dotenv/config'

const pool=mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})


async function  DBConn() {
    try{
        const conn=await pool.getConnection();
        console.log("mysql conntected")
        conn.release();
    }catch(e){
        console.log("MYSQL connected failed",e.message)
        process.exit()
    }
}

export { pool,DBConn};