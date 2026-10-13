import express from"express";
import db from "./db/db.config.js";
import mainRouter from "./src/api/main.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";
import cors from "cors"

const app = express()
//we are receiving json
app.use(express.json());

//giving access to our frontend
app.use(cors());


app.use("/api", mainRouter);


//error middleware
app.use(errorHandler)




async function startServer(){
    try {
        let connection = await db.getConnection();
        connection.release();
        console.log("db connected")
        const PORT = process.env.PORT || 3777;
        app.listen(PORT, (err) => {
            if(err){
                throw err;
            }
            console.log(`server is running on port http://localhost:${PORT}`);
        })
    } catch (error) {
       console.log("Error starting server:", error.message||error) 
    }
}

startServer()
