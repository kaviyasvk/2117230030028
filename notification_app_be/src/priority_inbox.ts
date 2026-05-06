import dotenv from "dotenv";
import { Log } from "../../logging_middleware/dist/index";

dotenv.config();

const BASE_URL = "http://20.207.122.201/evaluation-service";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrYXZpeWEucy4yMDIzLmFpbWxAcml0Y2hlbm5haS5lZHUuaW4iLCJleHAiOjE3NzgwNTE4MTUsImlhdCI6MTc3ODA1MDkxNSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjA4NzM5NjY5LWRmNWEtNGM5Ni04ZGEwLWUzZGM1ZDZkZjJiYiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Imthdml5YSIsInN1YiI6Ijg2NzA0ZDc4LWQwNjktNDFjZi05MjMwLWI3ZGJhYmI2M2RlZCJ9LCJlbWFpbCI6Imthdml5YS5zLjIwMjMuYWltbEByaXRjaGVubmFpLmVkdS5pbiIsIm5hbWUiOiJrYXZpeWEiLCJyb2xsTm8iOiIyMTE3MjMwMDMwMDI4IiwiYWNjZXNzQ29kZSI6IkJUQ0RxVCIsImNsaWVudElEIjoiODY3MDRkNzgtZDA2OS00MWNmLTkyMzAtYjdkYmFiYjYzZGVkIiwiY2xpZW50U2VjcmV0Ijoia0JzdmRCVmtmcFNQaEFkbSJ9.km3xTlFzWzn4OJpru4PXhn2w7536nm9VSvURF1-QPA4";

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

interface ScoredNotification {
  notification: Notification;
  score: number;
}

const TYPE_WEIGHTS: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getRecencyScore(timestamp: string): number {
  const now = new Date().getTime();
  const notifTime = new Date(timestamp).getTime();
  const diffHours = (now - notifTime) / (1000 * 60 * 60);
  return Math.max(0, 100 - diffHours);
}

function getScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 1;
  const recencyScore = getRecencyScore(notification.Timestamp);
  return typeWeight * recencyScore;
}

class MaxHeap {
  private heap: ScoredNotification[] = [];

  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number) { return 2 * i + 1; }
  private right(i: number) { return 2 * i + 2; }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(item: ScoredNotification) {
    this.heap.push(item);
    let i = this.heap.length - 1;
    while (i > 0 && this.heap[i].score > this.heap[this.parent(i)].score) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  extractMax(): ScoredNotification | null {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return max;
  }

  private heapifyDown(i: number) {
    let largest = i;
    const l = this.left(i);
    const r = this.right(i);
    if (l < this.heap.length && this.heap[l].score > this.heap[largest].score) largest = l;
    if (r < this.heap.length && this.heap[r].score > this.heap[largest].score) largest = r;
    if (largest !== i) {
      this.swap(i, largest);
      this.heapifyDown(largest);
    }
  }

  size() { return this.heap.length; }
}

export async function getTopNotifications(n: number): Promise<ScoredNotification[]> {
  try {
    Log("backend", "info", "service", `Fetching notifications for priority inbox top ${n}`);

    const res = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log("Status:", res.status);
    const data = await res.json() as { notifications: Notification[] };
    console.log("Data received:", JSON.stringify(data).slice(0, 200));

    if (!data.notifications || data.notifications.length === 0) {
      Log("backend", "warn", "service", "No notifications received from API");
      return [];
    }

    Log("backend", "info", "service", `Fetched ${data.notifications.length} notifications`);

    const heap = new MaxHeap();
    for (const notif of data.notifications) {
      heap.insert({ notification: notif, score: getScore(notif) });
    }

    const topN: ScoredNotification[] = [];
    for (let i = 0; i < n && heap.size() > 0; i++) {
      const item = heap.extractMax();
      if (item) topN.push(item);
    }

    Log("backend", "info", "service", `Returning top ${topN.length} priority notifications`);
    return topN;

  } catch (error) {
    Log("backend", "error", "service", `Priority inbox failed: ${error}`);
    console.error("Error:", error);
    return [];
  }
}