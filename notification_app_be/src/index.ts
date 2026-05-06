import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Log } from "../../logging_middleware/dist/index";
import notificationRouter from "./routes/notification.route";
import { getTopNotifications } from "./priority_inbox";

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

app.get("/api/priority-inbox", async (req: express.Request, res: express.Response) => {
  const n = parseInt(req.query.n as string) || 10;
  Log("backend", "info", "route", `Priority inbox requested for top ${n}`);
  const notifications = await getTopNotifications(n);
  res.status(200).json({ notifications });
});

app.listen(PORT, () => {
  Log("backend", "info", "config", `Server started on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

export default app;