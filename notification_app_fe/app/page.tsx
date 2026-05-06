"use client";
import { useEffect, useState } from "react";
import {
  Container, Typography, TextField, Button,
  Card, CardContent, Stack, Box, CssBaseline
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { fetchNotifications, createNotification } from "./api/notifications";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  const handleSubmit = async () => {
    if (!title || !message) return;
    await createNotification(title, message);
    setTitle("");
    setMessage("");
    loadNotifications();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4, backgroundColor: "#fff", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom color="primary">
          Notification System
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <Button variant="contained" onClick={handleSubmit} size="large">
              Send Notification
            </Button>
          </Stack>
        </Box>

        <Typography variant="h6" gutterBottom>
          All Notifications
        </Typography>

        <Stack spacing={2}>
          {notifications.map((n) => (
            <Card key={n.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{n.title}</Typography>
                <Typography color="text.secondary">{n.message}</Typography>
                <Typography variant="caption">
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
    </ThemeProvider>
  );
}