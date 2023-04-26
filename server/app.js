const express = require('express')
const app = express();
const PORT = 5000
const { connectDb } = require('./config/db')
const dotenv = require('dotenv')
const user = require("./modules/User/user.routes");
const post = require("./modules/Posts/posts.routes");


dotenv.config()

app.use(express.json()) // To parse incoming request

app.use("/api/v1", user);
app.use("/api/v1", post);


const startServer = async () => {
    try {
        connectDb(process.env.MONGO_URL);
        app.listen(PORT, () => {
            console.log("listening on port", PORT)
        })
    } catch (error) {
        console.log(error)
    }
}

startServer()








