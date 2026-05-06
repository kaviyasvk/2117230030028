# Notification System Design

## Stage 1

### REST API Design

#### 1. Get All Notifications
- **GET** `/api/notifications`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement|Event|Result",
      "message": "string",
      "timestamp": "2026-04-22 17:51:30",
      "isRead": false
    }
  ]
}
```

#### 2. Get Single Notification
- **GET** `/api/notifications/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "id": "uuid",
  "type": "Placement",
  "message": "string",
  "timestamp": "2026-04-22 17:51:30",
  "isRead": false
}
```

#### 3. Mark Notification as Read
- **PATCH** `/api/notifications/:id/read`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "Notification marked as read"
}
```

#### 4. Mark All as Read
- **PATCH** `/api/notifications/read-all`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "message": "All notifications marked as read"
}
```

#### Real-Time Notifications
Use **WebSockets** (Socket.io) for real-time delivery.
- Server emits `new_notification` event when a new notification arrives
- Client listens and updates UI instantly

---

## Stage 2

### Database Choice: PostgreSQL

**Reason:** Structured data with relationships, supports indexing, scales well.

### DB Schema

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  type VARCHAR(50) CHECK (type IN ('Event', 'Result', 'Placement')),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Scaling Problems & Solutions
- **Large data volume:** Partition notifications table by date
- **Slow queries:** Add indexes on `student_id`, `is_read`, `created_at`
- **High write load:** Use message queue (Redis/RabbitMQ)

---

## Stage 3

### Query Analysis

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

**Is it accurate?** Yes, logically correct.

**Why is it slow?**
- No index on `studentID` and `isRead` columns
- `SELECT *` fetches all columns unnecessarily
- 5,000,000 rows = full table scan

**Fix:**
```sql
CREATE INDEX idx_notifications_student_read 
ON notifications(student_id, is_read, created_at DESC);

SELECT id, message, type, created_at 
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC;
```

**Adding indexes on every column — is it safe?**
No! Too many indexes slow down INSERT/UPDATE operations and waste storage. Only index columns used in WHERE, ORDER BY, JOIN clauses.

**Find students with placement notification in last 7 days:**
```sql
SELECT DISTINCT student_id 
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Caching Strategy

**Problem:** DB overwhelmed on every page load.

**Solution: Redis Caching**

1. **Cache notifications per student** with TTL of 60 seconds
2. On page load → check Redis first → if miss, query DB and cache result
3. On new notification → invalidate that student's cache

**Tradeoffs:**
- Redis adds infrastructure complexity
- Slight staleness (up to 60s) is acceptable for notifications
- Reduces DB load by ~80%

**Other strategies:**
- Pagination — don't load all notifications at once
- CDN for static assets
- Database read replicas for read-heavy load

---

## Stage 5

### Revised Pseudocode for Bulk Notification

**Problem with original:**
- If `send_email` fails for 1 student, remaining 49,799 students are skipped
- Email and DB insert are tightly coupled — not reliable
- No retry mechanism

**Revised approach using Message Queue:**
function notify_all(student_ids, message):
for student_id in student_ids:
push_to_queue({ student_id, message })
worker function process_queue():
job = dequeue()
try:
send_email(job.student_id, job.message)  # async, retryable
save_to_db(job.student_id, job.message)  # only after email success
push_to_app(job.student_id, job.message) # real-time via WebSocket
catch error:
retry(job, max_retries=3)
if all_retries_failed:
log_to_dead_letter_queue(job)

**Why separate?**
- Email and DB should NOT be in same transaction
- If email fails, we can retry without duplicating DB insert
- Queue makes it fault-tolerant and scalable

---

## Stage 6

### Priority Inbox Implementation

See `notification_app_be/src/priority_inbox.ts` for implementation.

**Approach:**
- Fetch notifications from test server API
- Score each notification: weight = type_weight * recency_score
- Type weights: Placement=3, Result=2, Event=1
- Recency: newer notifications score higher
- Use a Max Heap to efficiently maintain top N notifications
- Supports dynamic N (top 10, 15, 20 as per user choice)

**Tradeoff:** 
- Heap approach is O(n log k) which is efficient for large datasets
- New notifications are inserted and heap is rebalanced automatically