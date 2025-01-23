import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connection.js";

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
    server.on('error', (error) => {
      console.error("Server error: ", error);
      process.exit(1);
    });
  })

  .catch((err) => {
    console.log("Mongo DB connection FAILED!!!!", err);
  });