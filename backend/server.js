import 'dotenv/config.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';


await connectDB();


app.get("/", (req, res) => {
  res.send("Running");
});

// sirf local machine par chalega
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000");
  });
}
