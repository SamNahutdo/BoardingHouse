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
import { supabase } from '../utils/supabase';

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

// Mock removed, using Supabase Realtime now

import { UserSearchDialog } from '../components/UserSearchDialog';

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
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

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
      setSelectedConversation(conversations[0]);
      setIsVideoCallActive(true);
      setSearchParams({});
    }
  }, [searchParams, conversations, setSearchParams]);

  const [allMessages, setAllMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`senderId.eq.${user.id},receiverId.eq.${user.id}`)
        .order('timestamp', { ascending: true });

      if (data) {
        setAllMessages(data.map(d => ({ ...d, timestamp: new Date(d.timestamp) })));
      }
    };

    fetchMessages();

    // Supabase Realtime Subscription!
    const channelId = `messages_channel_${user.id}`;
    const subscription = supabase
      .channel(channelId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        const sId = newMsg.senderId || newMsg.senderid;
        const rId = newMsg.receiverId || newMsg.receiverid;
        
        if (sId === user.id || rId === user.id) {
          setAllMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              senderId: sId,
              senderName: newMsg.senderName || newMsg.sendername,
              receiverId: rId,
              receiverName: newMsg.receiverName || newMsg.receivername,
              content: newMsg.content,
              timestamp: new Date(newMsg.timestamp),
              read: newMsg.read || false
            }];
          });
        }
      })
      .subscribe((status) => {
        console.log('Realtime status:', status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setGlobalSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearchingGlobal(true);
      const { data } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .neq('id', user.id)
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (data) {
        const existingParticipantIds = new Set(
          conversations.flatMap(c => c.participants)
        );
        const newUsers = data.filter(u => !existingParticipantIds.has(u.id));
        setGlobalSearchResults(newUsers);
      }
      setIsSearchingGlobal(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user, conversations]);

  useEffect(() => {
    if (!user) return;

    const userConversations: { [key: string]: Conversation } = {};

    allMessages.forEach((message) => {
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
  }, [allMessages, user]);

  useEffect(() => {
    if (!selectedConversation || !user) return;
    const conversationMessages = allMessages.filter(
      (msg) =>
        (msg.senderId === user.id && msg.receiverId === selectedConversation.participants.find(p => p !== user.id)) ||
        (msg.receiverId === user.id && msg.senderId === selectedConversation.participants.find(p => p !== user.id))
    );
    setMessages(conversationMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }, [selectedConversation, allMessages, user]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStartNewChat = (selectedUser: { id: string; name: string }) => {
    if (!user) return;
    const conversationId = [user.id, selectedUser.id].sort().join('-');
    const existing = conversations.find(c => c.id === conversationId);
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      const newConv: Conversation = {
        id: conversationId,
        participants: [user.id, selectedUser.id],
        participantNames: [user.name, selectedUser.name],
        lastMessage: {
          id: 'temp',
          senderId: user.id,
          senderName: user.name,
          receiverId: selectedUser.id,
          receiverName: selectedUser.name,
          content: 'Started a new conversation',
          timestamp: new Date(),
          read: true
        },
        unreadCount: 0
      };
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherUserId = selectedConversation.participants.find(p => p !== user.id)!;
    const otherUserName = selectedConversation.participantNames.find(n => n !== user.name)!;

    const message = {
      id: crypto.randomUUID(), // Local ID for deduplication
      senderId: user.id,
      senderName: user.name,
      receiverId: otherUserId,
      receiverName: otherUserName,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNewMessage('');
    // Optimistic update for instant feedback
    setAllMessages(prev => [...prev, { ...message, timestamp: new Date(message.timestamp) }]);
    
    // Background insert
    await supabase.from('messages').insert([message]);
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
          {searchQuery && globalSearchResults.length > 0 && (
            <div className="p-2 border-b border-border/50 bg-accent/10">
              <h3 className="px-2 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Users found</h3>
              {globalSearchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    handleStartNewChat(u);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent cursor-pointer transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 font-semibold">{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-green-600 truncate">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && !searchQuery ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No messages found</p>
            </div>
          ) : filteredConversations.length === 0 && searchQuery && globalSearchResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No users or chats found</p>
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
              <Button className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 h-12" onClick={() => setSearchDialogOpen(true)}>
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

      <UserSearchDialog 
        open={searchDialogOpen} 
        onOpenChange={setSearchDialogOpen} 
        onSelectUser={handleStartNewChat} 
        currentUserId={user.id} 
      />
    </div>
  );
}