import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then( () => {
    const port = process.env.PORT || 8000;
    const server = app.listen(port)

    server.on("listening", () =>{
        console.log(`Server is running at port: ${port}`);
        
    })

    server.on("error", (err) => {
        console.log("Server failed to start", err);
        
    })
})
.catch((err) =>{
    console.log("DB connection is Failed !!!: ", err);
    
})