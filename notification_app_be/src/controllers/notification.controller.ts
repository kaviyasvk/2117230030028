import { Request, Response } from "express";
import { Log } from "../../../logging_middleware/dist/index";
import * as NotificationService from "../services/notification.service";

export const createNotification = async (req: Request, res: Response) => {
  try {
    Log("backend", "info", "handler", "Create notification request received");
    const notification = await NotificationService.create(req.body);
    Log("backend", "info", "handler", "Notification created successfully");
    res.status(201).json(notification);
  } catch (error) {
    Log("backend", "error", "handler", `Failed to create notification: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    Log("backend", "info", "handler", "Get all notifications request received");
    const notifications = await NotificationService.getAll();
    res.status(200).json(notifications);
  } catch (error) {
    Log("backend", "error", "handler", `Failed to fetch notifications: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};