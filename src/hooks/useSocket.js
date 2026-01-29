import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '@/utils/auth';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Initialize socket connection - creates fresh connection when entering the Chat page
    const serverUrl = process.env.SERVER_URL || 'https://www.preciousgoldsmith.net';
    const newSocket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Socket event handlers
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Chat specific methods
  const joinChat = (chatId) => {
    emit('join_chat', chatId);
  };

  const sendMessage = (chatId, message, messageType = 'text', attachments = []) => {
    emit('send_message', {
      chatId,
      message,
      messageType,
      attachments
    });
  };

  const markAsRead = (chatId) => {
    emit('mark_read', { chatId });
  };

  const setTyping = (chatId, isTyping) => {
    emit('typing', { chatId, isTyping });
  };

  const setUserStatus = (isOnline) => {
    emit('user_status', { isOnline });
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    on,
    off,
    emit,
    joinChat,
    sendMessage,
    markAsRead,
    setTyping,
    setUserStatus
  };
};

export default useSocket;
