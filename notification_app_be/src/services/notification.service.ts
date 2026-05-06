import { Log } from "../../../logging_middleware/dist/index";

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
}

let notifications: Notification[] = [];
let idCounter = 1;

export const create = async (body: { title: string; message: string }) => {
  Log("backend", "debug", "service", `Creating notification: ${body.title}`);
  const notification: Notification = {
    id: idCounter++,
    title: body.title,
    message: body.message,
    createdAt: new Date()
  };
  notifications.push(notification);
  return notification;
};

export const getAll = async () => {
  Log("backend", "debug", "service", `Fetching all notifications, count: ${notifications.length}`);
  return notifications;
};