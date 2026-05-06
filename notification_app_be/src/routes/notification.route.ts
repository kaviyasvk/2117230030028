import { Router } from "express";
import { createNotification, getNotifications } from "../controllers/notification.controller";

const router = Router();

router.post("/", createNotification);
router.get("/", getNotifications);

export default router;