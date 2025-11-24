import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Send, Mail, MailOpen, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MessagesPageProps {
  onNavigate: (page: string) => void;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender: {
    full_name: string;
  };
  recipient: {
    full_name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
}

export const MessagesPage = ({ onNavigate }: MessagesPageProps) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [farmers, setFarmers] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
  });
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (profile) {
      loadMessages();
      loadFarmers();
      loadAllUsers();
    }
  }, [profile]);

  const loadMessages = async () => {
    if (!profile) return;

    try {
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(full_name), recipient:profiles!messages_recipient_id_fkey(full_name)')
        .eq('sender_id', profile.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(full_name), recipient:profiles!messages_recipient_id_fkey(full_name)')
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false });

      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_type', 'farmer');

      setFarmers(data || []);
    } catch (error) {
      console.error('Error loading farmers:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, user_type');

      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    try {
      await supabase.from('messages').insert({
        sender_id: profile.id,
        recipient_id: formData.recipient_id,
        subject: formData.subject,
        content: formData.content,
        is_read: false,
      });

      setFormData({ recipient_id: '', subject: '', content: '' });
      setShowCompose(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowReply(false);
    setReplyContent('');

    if (!message.is_read && message.recipient_id === profile?.id) {
      await supabase.from('messages').update({ is_read: true }).eq('id', message.id);
      loadMessages();
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || !selectedMessage) return;

    try {
      const recipientId = selectedMessage.sender_id === profile.id
        ? selectedMessage.recipient_id
        : selectedMessage.sender_id;

      await supabase.from('messages').insert({
        sender_id: profile.id,
        recipient_id: recipientId,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        is_read: false,
      });

      setReplyContent('');
      setShowReply(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view messages.</p>
          <Button onClick={() => onNavigate('login')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">Communicate with buyers and sellers</p>
          </div>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="h-5 w-5 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">All Messages</h2>
              {messages.length === 0 ? (
                <p className="text-gray-600 text-center py-8 text-sm">No messages yet</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 truncate flex-1">
                          {message.sender_id === profile.id
                            ? `To: ${message.recipient.full_name}`
                            : message.sender.full_name}
                        </span>
                        {!message.is_read && message.recipient_id === profile.id && (
                          <Mail className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedMessage ? (
              <>
                <Card className="p-6">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      {selectedMessage.is_read ? (
                        <MailOpen className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Mail className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {selectedMessage.sender_id === profile.id ? (
                          <>To: {selectedMessage.recipient.full_name}</>
                        ) : (
                          <>From: {selectedMessage.sender.full_name}</>
                        )}
                      </span>
                      <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button onClick={() => setShowReply(!showReply)}>
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </Card>

                {showReply && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Reply to {selectedMessage.sender_id === profile.id
                        ? selectedMessage.recipient.full_name
                        : selectedMessage.sender.full_name}
                    </h3>
                    <form onSubmit={handleReply} className="space-y-4">
                      <Textarea
                        label="Your Reply"
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={6}
                        required
                      />
                      <div className="flex gap-3">
                        <Button type="submit">
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowReply(false);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <Send className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select a message to view or compose a new one
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <select
                  value={formData.recipient_id}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a user...</option>
                  {profile?.user_type === 'buyer' ? (
                    <>
                      <optgroup label="Farmers">
                        {farmers.map((farmer) => (
                          <option key={farmer.id} value={farmer.id}>
                            {farmer.full_name}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <optgroup label="All Users">
                        {allUsers.filter(u => u.id !== profile?.id).map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
              <Input
                label="Subject"
                placeholder="Message subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <Textarea
                label="Message"
                placeholder="Write your message..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
