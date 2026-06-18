import 'dotenv/config.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';

await connectDB();

// Only bind to a port in local dev — Vercel invokes the exported handler directly
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Vercel serverless entry point — exports the Express app as the request handler
export default app;
