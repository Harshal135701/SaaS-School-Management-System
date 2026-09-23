import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextData {
  unreadMessageCount: number;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextData | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const refreshUnreadCount = async () => {
    try {
      const res = await api.get('/franchise/chat/unread-count');
      if (res.data?.success) {
        setUnreadMessageCount(res.data.count);
      }
    } catch (e) {
      console.error("Failed to fetch unread count", e);
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;

    refreshUnreadCount();
    refreshNotifications();

    const newSocket = io("http://localhost:5000", {
      auth: { token }
    });

    newSocket.on("notification_new_message", (data) => {
      refreshUnreadCount();
      
      setNotifications(prev => {
        // Prevent duplicate if already exists
        if (prev.find(n => n.id === data.notificationId)) return prev;
        
        return [
          {
            id: data.notificationId,
            title: "New message",
            message: `You have a new message from ${data.senderName}`,
            type: "CHAT_MESSAGE",
            isRead: false,
            createdAt: data.createdAt
          },
          ...prev
        ];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  return (
    <NotificationContext.Provider value={{
      unreadMessageCount,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      deleteNotification,
      refreshUnreadCount,
      refreshNotifications,
      socket
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
