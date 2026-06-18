import 'dotenv/config.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';


await connectDB();


// sirf local machine par chalega
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000");
  });
}

// Required for Vercel's @vercel/node builder: it needs a default-exported
// request handler to invoke. Express apps work directly as that handler.
export default app;
