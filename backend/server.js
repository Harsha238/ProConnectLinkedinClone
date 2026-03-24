import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use(postRoutes);
app.use("/",userRoutes);

// static files
app.use(express.static("uploads"));

mongoose.connect(process.env.MONGO_URI).then(() => {
  const PORT = process.env.PORT || 9080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});