import 'dotenv/config.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';


await connectDB();


app.get("/", (req, res) => {
  res.send("Running");
});

// sirf local machine par chalega
if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
}
