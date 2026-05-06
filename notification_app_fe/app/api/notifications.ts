const BASE_URL = "http://localhost:5000/api/notifications"; 

export const fetchNotifications = async () => {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data;
};

export const createNotification = async (title: string, message: string) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, message })
  });
  const data = await res.json();
  return data;
};