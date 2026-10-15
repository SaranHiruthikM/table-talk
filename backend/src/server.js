import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import recipeRoutes from "./routes/recipes.js";

const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
  }),
);
app.use(express.json({ limit: "8mb" }));
app.use(morgan("dev"));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/recipes", recipeRoutes);
app.use((error, _req, res, _next) =>
  res.status(500).json({ message: error.message || "Something went wrong." }),
);

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() =>
    app.listen(port, () =>
      console.log(`Recipe API running on http://localhost:${port}`),
    ),
  )
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
