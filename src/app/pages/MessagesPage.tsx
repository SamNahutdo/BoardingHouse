import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Video, Phone, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useSearchParams } from 'react-router';

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
    timestamp: new Date('2024-01-16T14:00:00'),
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
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

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

    mockMessages.forEach((message) => {
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

    setConversations(Object.values(userConversations));
  }, [user]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const conversationMessages = mockMessages.filter(
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Messages
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="p-4 rounded-2xl">
              <h3 className="font-semibold mb-4">Conversations</h3>
              {conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No messages yet
                </p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.participantNames
                              .find(name => name !== user.name)?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.participantNames.find(name => name !== user.name)}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="p-4 rounded-2xl h-[600px] flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedConversation.participantNames
                          .find(name => name !== user.name)?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {selectedConversation.participantNames.find(name => name !== user.name)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mode === 'owner' ? 'Guest' : 'Property Owner'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartVideoCall}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          message.senderId === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.senderId !== user.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.senderName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            message.senderId === user.id
                              ? 'bg-green-600 text-white'
                              : 'bg-accent'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.senderId === user.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
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