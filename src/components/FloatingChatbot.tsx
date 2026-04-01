import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { libraryService } from '@/services/libraryService';
import { askChatbot, checkOllamaAvailability, type ChatMessage } from '@/services/chatbotService';
import { toast } from 'sonner';

export function FloatingChatbot() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkOllamaAvailability().then(setOllamaAvailable);
  }, []);

  useEffect(() => {
    const messagesContainer = document.querySelector('.floating-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const papers = libraryService.getSavedPapers(currentUser.id);
      
      if (papers.length === 0) {
        const botMessage: ChatMessage = {
          id: `msg_${Date.now()}_bot`,
          role: 'assistant',
          content: "You don't have any papers saved in your library yet. To use the AI assistant:\n\n1. Go to the Home page\n2. Search for research papers\n3. Click the star (⭐) icon on papers to save them\n4. Come back here and ask questions!\n\nTip: Save at least 3-5 papers for better results.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      const { answer, sources } = await askChatbot(input.trim(), papers, messages);

      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        sources
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errorMsg);
      
      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#4285f4] hover:bg-[#1557b0] z-50"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-[#dadce0] flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#dadce0] bg-[#4285f4] text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-medium">Research Assistant</h3>
                <p className="text-xs opacity-90">Ask about your papers</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Ollama Status */}
          {ollamaAvailable === false && (
            <div className="p-3 bg-yellow-50 border-b border-yellow-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Ollama not running</p>
                <p>Install Ollama and run: <code className="bg-yellow-100 px-1 rounded">ollama pull phi3</code></p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="floating-chat-messages flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(600px - 180px)' }}>
            {messages.length === 0 ? (
              <div className="text-center text-[#5f6368] py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#dadce0]" />
                <p className="text-sm mb-2">Ask me anything about your research papers!</p>
                <div className="text-xs space-y-1">
                  <p>• "Summarize papers about machine learning"</p>
                  <p>• "What methods are used in my papers?"</p>
                  <p>• "Compare the results of different studies"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 break-words ${
                        msg.role === 'user'
                          ? 'bg-[#4285f4] text-white'
                          : 'bg-[#f1f3f4] text-[#202124]'
                      }`}
                    >
                      <div 
                        className="text-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ 
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/^\u2022 /gm, '&bull; ')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#dadce0]">
                          <p className="text-xs opacity-75 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((source, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                [{idx + 1}] {source.slice(0, 25)}...
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#f1f3f4] rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#5f6368]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#dadce0]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                disabled={isLoading || ollamaAvailable === false}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || ollamaAvailable === false}
                className="bg-[#4285f4] hover:bg-[#1557b0]"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
