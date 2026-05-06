import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Log } from "../../logging_middleware/dist/index";
import notificationRouter from "./routes/notification.route";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/api/notifications", notificationRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Log("backend", "info", "config", `Server started on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

export default app;