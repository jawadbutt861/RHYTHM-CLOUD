import './src/config/env.js'
import app from "./src/app.js";
import connectdb from "./src/db/db.js";

connectdb()

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`Server is Running on ${PORT}`)
})