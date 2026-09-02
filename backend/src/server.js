import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = Number(process.env.PORT) || 10000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `TrainSafe backend running on 0.0.0.0:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();