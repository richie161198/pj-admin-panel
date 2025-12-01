import { io } from 'socket.io-client';
import { getToken } from './auth';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('Socket: No token found');
      return;
    }

    // Get base URL - extract from API base URL (remove /api/v0 suffix)
    // Default to 35.154.139.118 if not set
    // const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://35.154.139.118/api/v0';
    const apiBaseUrl = 'http://35.154.139.118/api/v0';
    const baseUrl = apiBaseUrl.replace('/api/v0', '').replace('/api/v0/', '');

    this.socket = io(baseUrl, {
      transports: ['websocket'],
      auth: {
        token: token
      },
      query: {
        token: token // Also send in query for compatibility
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket: Connected');
      this.isConnected = true;
      // Notify listeners
      if (this.listeners.has('connect')) {
        this.listeners.get('connect').forEach(cb => cb());
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket: Disconnected');
      this.isConnected = false;
      // Notify listeners
      if (this.listeners.has('disconnect')) {
        this.listeners.get('disconnect').forEach(cb => cb());
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket: Error', error);
      // Notify listeners
      if (this.listeners.has('error')) {
        this.listeners.get('error').forEach(cb => cb(error));
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket: Connection error', error);
      // Notify listeners
      if (this.listeners.has('error')) {
        this.listeners.get('error').forEach(cb => cb(error));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.error('Socket: Not connected, cannot listen to', event);
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }

    if (this.listeners.has(event)) {
      if (callback) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket: Not connected, cannot emit', event);
      return;
    }

    this.socket.emit(event, data);
  }

  // Ticket-specific methods
  joinTicket(ticketId) {
    this.emit('join_ticket', ticketId);
  }

  leaveTicket(ticketId) {
    // Socket.io client doesn't have a direct leave method
    // The socket will automatically leave rooms on disconnect
    // For explicit leaving, we can emit a custom event if needed
    // For now, just disconnect if needed or let it handle automatically
  }

  sendTicketMessage(ticketId, message, isInternal = false) {
    this.emit('send_ticket_message', {
      ticketId,
      message,
      isInternal
    });
  }

  updateTicketStatus(ticketId, status, adminNote = null) {
    this.emit('update_ticket_status', {
      ticketId,
      status,
      adminNote
    });
  }

  sendTypingIndicator(ticketId, isTyping) {
    this.emit('ticket_typing', {
      ticketId,
      isTyping
    });
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

