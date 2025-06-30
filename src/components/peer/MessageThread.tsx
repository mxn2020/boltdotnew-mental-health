// src/components/peer/MessageThread.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Send, Flag, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PeerMessage, GroupMessage, peerSupportService } from '../../lib/peerSupport';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';

interface MessageThreadProps {
  matchId?: string;
  groupId?: string;
  title: string;
  isGroup?: boolean;
  onClose?: () => void;
}

export function MessageThread({ matchId, groupId, title, isGroup = false, onClose }: MessageThreadProps) {
  const [messages, setMessages] = useState<(PeerMessage | GroupMessage)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Set up real-time subscription
    let subscription: any;
    if (matchId) {
      subscription = peerSupportService.subscribeToMatchMessages(matchId, (message) => {
        setMessages(prev => [...prev, message]);
      });
    } else if (groupId) {
      subscription = peerSupportService.subscribeToGroupMessages(groupId, (message) => {
        setMessages(prev => [...prev, message]);
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [matchId, groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      let result;
      if (matchId) {
        result = await peerSupportService.getMessages(matchId);
      } else if (groupId) {
        result = await peerSupportService.getGroupMessages(groupId);
      }

      if (result?.data) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      let result;
      if (matchId) {
        result = await peerSupportService.sendMessage(matchId, newMessage.trim());
      } else if (groupId) {
        result = await peerSupportService.sendGroupMessage(groupId, newMessage.trim());
      }

      if (result?.data) {
        setMessages(prev => [...prev, result.data!]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFlagMessage = async (messageId: string) => {
    const reason = prompt('Please provide a reason for flagging this message:');
    if (!reason) return;

    try {
      await peerSupportService.flagMessage(messageId, reason, isGroup);
      alert('Message has been flagged for review. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error flagging message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (message: PeerMessage | GroupMessage) => {
    // This would need to be implemented based on current user context
    // For now, we'll use a simple heuristic
    return false; // Placeholder
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Start the conversation by sending a message below
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'flex',
                    isOwnMessage(message) ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                      isOwnMessage(message)
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={clsx(
                          'text-xs',
                          isOwnMessage(message) ? 'text-teal-100' : 'text-gray-500'
                        )}
                      >
                        {format(parseISO(message.created_at), 'HH:mm')}
                      </span>
                      
                      {!isOwnMessage(message) && (
                        <button
                          onClick={() => handleFlagMessage(message.id)}
                          className="text-xs text-gray-400 hover:text-red-500 ml-2"
                          title="Flag message"
                        >
                          <Flag className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Safety Notice */}
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center space-x-2 text-xs text-blue-800">
              <Shield className="h-4 w-4" />
              <span>
                This conversation is monitored for safety. Please be respectful and supportive.
              </span>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}