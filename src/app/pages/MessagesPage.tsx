import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Video, Phone, Mic, MicOff, VideoOff, X, Paperclip, Image as ImageIcon, MoreVertical, Search as SearchIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useSearchParams } from 'react-router';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: Message;
  unreadCount: number;
}

// Mock messages data
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'guest1',
    senderName: 'Juan Dela Cruz',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'Hi, I\'m interested in booking your boarding house for next week.',
    timestamp: new Date('2024-01-15T10:00:00'),
    read: false,
  },
  {
    id: '2',
    senderId: 'owner1',
    senderName: 'Maria Santos',
    receiverId: 'guest1',
    receiverName: 'Juan Dela Cruz',
    content: 'Hello! Thank you for your interest. We have availability. What dates are you looking for?',
    timestamp: new Date('2024-01-15T10:30:00'),
    read: false,
  },
  {
    id: '3',
    senderId: 'guest2',
    senderName: 'Ana Garcia',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'Can I bring my pet?',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: '4',
    senderId: 'owner1',
    senderName: 'Maria Santos',
    receiverId: 'guest2',
    receiverName: 'Ana Garcia',
    content: 'Yes, we are pet-friendly! There is just a small deposit required.',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
  {
    id: '5',
    senderId: 'guest3',
    senderName: 'Cris Milla',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'Good morning! Is the 4-bed dorm still available for next semester?',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 15), // 15 mins ago
    read: false,
  },
  {
    id: '6',
    senderId: 'guest4',
    senderName: 'Warren Comiling',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'Do you have curfew times implemented?',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 45), // 45 mins ago
    read: true,
  },
  {
    id: '7',
    senderId: 'guest5',
    senderName: 'Jaylord Abansado',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'I already paid the reservation fee online. Here is my receipt.',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
  },
  {
    id: '8',
    senderId: 'owner1',
    senderName: 'Maria Santos',
    receiverId: 'guest6',
    receiverName: 'JB Ladaran',
    content: 'Hi JB, just reminding you about your upcoming check-in tomorrow.',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
  },
  {
    id: '9',
    senderId: 'guest7',
    senderName: 'Shiela Comaps',
    receiverId: 'owner1',
    receiverName: 'Maria Santos',
    content: 'Is internet included in the monthly rent? Thanks!!',
    timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
  },
];

export function MessagesPage() {
  const { user, mode } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if VC was requested from URL
  useEffect(() => {
    const vcParam = searchParams.get('vc');
    if (vcParam === 'true' && conversations.length > 0) {
      // Auto-select first conversation and start VC
      setSelectedConversation(conversations[0]);
      setIsVideoCallActive(true);
      // Remove the vc parameter from URL
      setSearchParams({});
    }
  }, [searchParams, conversations, setSearchParams]);

  useEffect(() => {
    if (!user) return;

    // Group messages into conversations
    const userConversations: { [key: string]: Conversation } = {};

    // Map the mock 'owner1' to current user so mock data always shows up for the logged in user
    const dynamicMessages = mockMessages.map(msg => ({
      ...msg,
      senderId: msg.senderId === 'owner1' ? user.id : msg.senderId,
      senderName: msg.senderId === 'owner1' ? user.name : msg.senderName,
      receiverId: msg.receiverId === 'owner1' ? user.id : msg.receiverId,
      receiverName: msg.receiverId === 'owner1' ? user.name : msg.receiverName,
    }));

    dynamicMessages.forEach((message) => {
      if (message.senderId === user.id || message.receiverId === user.id) {
        const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
        const otherUserName = message.senderId === user.id ? message.receiverName : message.senderName;

        const conversationId = [user.id, otherUserId].sort().join('-');

        if (!userConversations[conversationId]) {
          userConversations[conversationId] = {
            id: conversationId,
            participants: [user.id, otherUserId],
            participantNames: [user.name, otherUserName],
            lastMessage: message,
            unreadCount: message.senderId !== user.id && !message.read ? 1 : 0,
          };
        } else {
          if (message.timestamp > userConversations[conversationId].lastMessage.timestamp) {
            userConversations[conversationId].lastMessage = message;
          }
          if (message.senderId !== user.id && !message.read) {
            userConversations[conversationId].unreadCount++;
          }
        }
      }
    });

    setConversations(Object.values(userConversations).sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()));
  }, [user]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Ensure we filter from the dynamically mapped messages so they show up
    const dynamicMessages = mockMessages.map(msg => ({
      ...msg,
      senderId: msg.senderId === 'owner1' ? user?.id || '' : msg.senderId,
      senderName: msg.senderId === 'owner1' ? user?.name || '' : msg.senderName,
      receiverId: msg.receiverId === 'owner1' ? user?.id || '' : msg.receiverId,
      receiverName: msg.receiverId === 'owner1' ? user?.name || '' : msg.receiverName,
    }));

    const conversationMessages = dynamicMessages.filter(
      (msg) =>
        (msg.senderId === user?.id && msg.receiverId === conversation.participants.find(p => p !== user?.id)) ||
        (msg.receiverId === user?.id && msg.senderId === conversation.participants.find(p => p !== user?.id))
    );
    setMessages(conversationMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherUserId = selectedConversation.participants.find(p => p !== user.id)!;
    const otherUserName = selectedConversation.participantNames.find(n => n !== user.name)!;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      receiverId: otherUserId,
      receiverName: otherUserName,
      content: newMessage,
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleStartVideoCall = () => {
    setIsVideoCallActive(true);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    setIsMicOn(true);
    setIsVideoOn(true);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view messages</h2>
          <p className="text-muted-foreground">Please sign in to access your messages.</p>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter(c => 
    c.participantNames.find(n => n !== user.name)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col bg-card ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold mb-4">Chats</h2>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Messenger..." 
              className="pl-9 bg-accent/50 border-none rounded-full h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => {
                const otherUserName = conversation.participantNames.find(name => name !== user.name);
                const isSelected = selectedConversation?.id === conversation.id;
                const isUnread = conversation.unreadCount > 0;
                
                return (
                  <motion.div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent/80' : 'hover:bg-accent/40'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14 border border-background shadow-sm">
                        <AvatarFallback className={isSelected ? 'bg-green-600 text-white' : ''}>
                          {otherUserName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isUnread && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`truncate text-base ${isUnread ? 'font-bold' : 'font-medium'}`}>
                          {otherUserName}
                        </p>
                        <p className={`text-xs whitespace-nowrap ml-2 ${isUnread ? 'text-green-600 font-bold' : 'text-muted-foreground'}`}>
                          {format(conversation.lastMessage.timestamp, 'MMM d')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {conversation.lastMessage.senderId === user.id ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                        {isUnread && (
                          <div className="h-5 min-w-[20px] rounded-full bg-green-600 flex items-center justify-center px-1.5">
                            <span className="text-[10px] font-bold text-white">{conversation.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-background ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 border-b flex items-center justify-between bg-card shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden mr-1 -ml-2" 
                  onClick={() => setSelectedConversation(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {selectedConversation.participantNames.find(name => name !== user.name)?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base leading-tight">
                    {selectedConversation.participantNames.find(name => name !== user.name)}
                  </h3>
                  <p className="text-xs text-green-600 font-medium">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full h-10 w-10">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleStartVideoCall} className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full h-10 w-10">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-10 w-10 hidden sm:flex">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-background">
              {messages.map((message, index) => {
                const isMe = message.senderId === user.id;
                const showAvatar = index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <div className="w-8 shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8 shadow-sm border border-background">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10">
                                {message.senderName[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl relative shadow-sm ${
                            isMe
                              ? 'bg-green-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-accent border border-border/50 text-foreground rounded-bl-sm'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                        </div>
                        {showAvatar && (
                          <span className="text-[11px] text-muted-foreground mt-1 px-1">
                            {format(message.timestamp, 'h:mm a')} {isMe && '• Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 md:p-4 bg-card border-t shrink-0">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex gap-1 pb-1">
                  <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50 rounded-full h-9 w-9 shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50 rounded-full h-9 w-9 shrink-0 hidden sm:flex">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex-1 border bg-accent/30 rounded-2xl flex items-center pr-1 focus-within:ring-2 focus-within:ring-green-600/20 focus-within:border-green-600/50 transition-all">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="border-0 bg-transparent flex-1 focus-visible:ring-0 shadow-none h-11 px-4"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="icon"
                    className={`h-9 w-9 rounded-full shrink-0 transition-all ${
                      newMessage.trim() 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md scale-100' 
                        : 'bg-transparent text-muted-foreground scale-95 opacity-50'
                    }`}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-background p-6">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Your Messages</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Send private photos and messages to guests or owners.
              </p>
              <Button className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 h-12" onClick={() => {}}>
                Start a conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Overlay */}
      {isVideoCallActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Video Call Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedConversation?.participantNames
                      .find(name => name !== user.name)?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation?.participantNames.find(name => name !== user.name)}
                  </h3>
                  <p className="text-sm text-muted-foreground">Video call in progress...</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndVideoCall}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Video Area */}
            <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
              {/* Mock video interface */}
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedConversation?.participantNames.find(name => name !== user.name)}
                </h3>
                <p className="text-gray-400">Video call active</p>
              </div>

              {/* Self video thumbnail */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4 p-6 bg-background">
              <Button
                variant={isMicOn ? "outline" : "destructive"}
                size="lg"
                onClick={toggleMic}
                className="rounded-full w-12 h-12 p-0"
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOn ? "outline" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0"
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndVideoCall}
                className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}