import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetAllChatsQuery, useGetChatByIdQuery, useSendMessageMutation, useMarkAsReadMutation, useAssignChatMutation, useUpdateChatStatusMutation } from '@/store/api/chat/chatApi';
import useSocket from '@/hooks/useSocket';

const Chat = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket connection
  const { socket, isConnected, on, off, joinChat, sendMessage: socketSendMessage, markAsRead: socketMarkAsRead, setTyping } = useSocket();

  // API queries
  const { data: chatsData, isLoading: chatsLoading, refetch: refetchChats } = useGetAllChatsQuery({
    page: 1,
    limit: 50
  });

  const { data: chatData, isLoading: chatLoading, refetch: refetchChat } = useGetChatByIdQuery(selectedChat?.id, {
    skip: !selectedChat?.id
  });

  // Mutations
  const [sendMessageMutation] = useSendMessageMutation();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [assignChatMutation] = useAssignChatMutation();
  const [updateChatStatusMutation] = useUpdateChatStatusMutation();

  const chats = chatsData?.data?.chats || [];
  const currentChat = chatData?.data;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.chatId === selectedChat?.id) {
        refetchChat();
      }
      refetchChats();
    };

    const handleUserTyping = (data) => {
      if (data.chatId === selectedChat?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          if (data.isTyping) {
            return [...filtered, { userId: data.userId, userName: data.userName }];
          }
          return filtered;
        });
      }
    };

    const handleMessagesRead = (data) => {
      if (data.chatId === selectedChat?.id) {
        refetchChat();
      }
    };

    const handleChatNotification = (data) => {
      toast.info(`New message from ${data.sender}: ${data.message}`);
    };

    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);
    on('messages_read', handleMessagesRead);
    on('chat_notification', handleChatNotification);

    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      off('messages_read', handleMessagesRead);
      off('chat_notification', handleChatNotification);
    };
  }, [socket, selectedChat, on, off, refetchChat, refetchChats]);

  // Join chat when selected
  useEffect(() => {
    if (selectedChat?.id && socket) {
      joinChat(selectedChat.id);
    }
  }, [selectedChat, socket, joinChat]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat?.id && currentChat) {
      socketMarkAsRead(selectedChat.id);
      markAsReadMutation(selectedChat.id);
    }
  }, [selectedChat, currentChat, socketMarkAsRead, markAsReadMutation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat?.id) return;

    try {
      // Send via socket for real-time
      socketSendMessage(selectedChat.id, message.trim());
      
      // Also send via API for persistence
      await sendMessageMutation({
        chatId: selectedChat.id,
        message: message.trim()
      });

      setMessage('');
      setIsTyping(false);
      setTyping(selectedChat.id, false);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && selectedChat?.id) {
      setIsTyping(true);
      setTyping(selectedChat.id, true);
    }

    // Clear typing indicator after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat?.id) {
        setTyping(selectedChat.id, false);
      }
    }, 3000);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessage('');
    setIsTyping(false);
    setTypingUsers([]);
  };

  const handleAssignChat = async (chatId, adminId) => {
    try {
      await assignChatMutation({ chatId, adminId });
      toast.success('Chat assigned successfully');
      refetchChats();
    } catch (error) {
      toast.error('Failed to assign chat');
    }
  };

  const handleUpdateStatus = async (chatId, status) => {
    try {
      await updateChatStatusMutation({ chatId, status });
      toast.success('Chat status updated');
      refetchChats();
    } catch (error) {
      toast.error('Failed to update chat status');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'closed': return 'danger';
      case 'pending': return 'warning';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (chatsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Support</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'} • {chats.length} active chats
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card title="Active Chats" className="h-full">
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={chat.participants.find(p => p.role === 'user')?.userId?.profilePhoto}
                      alt="User"
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.participants.find(p => p.role === 'user')?.userId?.name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(chat.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge color={getStatusColor(chat.status)} size="sm">
                          {chat.status}
                        </Badge>
                        <Badge color={getPriorityColor(chat.priority)} size="sm">
                          {chat.priority}
                        </Badge>
                        {chat.messages.filter(msg => !msg.isRead).length > 0 && (
                          <Badge color="danger" size="sm">
                            {chat.messages.filter(msg => !msg.isRead).length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {chat.messages[chat.messages.length - 1]?.message || 'No messages'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={currentChat?.participants?.find(p => p.role === 'user')?.userId?.profilePhoto}
                    alt="User"
                    size="sm"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentChat?.participants?.find(p => p.role === 'user')?.userId?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge color={getStatusColor(currentChat?.status)} size="sm">
                        {currentChat?.status}
                      </Badge>
                      <Badge color={getPriorityColor(currentChat?.priority)} size="sm">
                        {currentChat?.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleUpdateStatus(selectedChat.id, 'resolved')}
                    className="btn btn-sm btn-outline-success"
                  >
                    Resolve
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedChat.id, 'closed')}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {currentChat?.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderRole === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim()}
                    className="btn btn-primary"
                  >
                    <Icon icon="ph:paper-plane-tilt" />
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon icon="ph:chat-circle" className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a chat to start conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a chat from the list to view messages
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
