import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Plus, Trash2, AlertCircle, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { libraryService } from '@/services/libraryService';
import { 
  askChatbot, 
  checkOllamaAvailability, 
  chatSessionService,
  type ChatMessage,
  type ChatSession 
} from '@/services/chatbotService';
import { toast } from 'sonner';

export function ChatbotPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkOllamaAvailability().then(setOllamaAvailable);
    if (currentUser) {
      const savedSessions = chatSessionService.getSessions(currentUser.id);
      setSessions(savedSessions);
      if (savedSessions.length > 0) {
        setCurrentSession(savedSessions[0]);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

  const handleNewSession = () => {
    const newSession = chatSessionService.createSession('New Chat');
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!currentUser) return;
    chatSessionService.deleteSession(currentUser.id, sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(sessions[0] || null);
    }
    toast.success('Chat deleted');
  };

  const handleSend = async () => {
    console.log('🔵 Send button clicked', { 
      hasInput: !!input.trim(), 
      hasUser: !!currentUser, 
      isLoading,
      hasSession: !!currentSession,
      paperCount 
    });
    
    if (!input.trim() || !currentUser || isLoading) return;

    // Create a new session if none exists
    let sessionToUse = currentSession;
    if (!sessionToUse) {
      console.log('📝 Creating new session...');
      sessionToUse = chatSessionService.createSession('New Chat');
      setCurrentSession(sessionToUse);
      setSessions(prev => [sessionToUse, ...prev]);
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedSession = {
      ...sessionToUse,
      messages: [...sessionToUse.messages, userMessage],
      updatedAt: new Date(),
      title: sessionToUse.messages.length === 0 ? input.slice(0, 50) : sessionToUse.title
    };

    setCurrentSession(updatedSession);
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
        
        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, botMessage]
        };
        
        setCurrentSession(finalSession);
        chatSessionService.saveSession(currentUser.id, finalSession);
        setIsLoading(false);
        return;
      }

      const { answer, sources } = await askChatbot(
        input.trim(), 
        papers, 
        updatedSession.messages
      );

      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        sources
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, botMessage]
      };

      setCurrentSession(finalSession);
      chatSessionService.saveSession(currentUser.id, finalSession);
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errorMsg);
      
      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, botMessage]
      };
      
      setCurrentSession(finalSession);
      chatSessionService.saveSession(currentUser.id, finalSession);
    } finally {
      setIsLoading(false);
    }
  };

  const paperCount = currentUser ? libraryService.getSavedPapers(currentUser.id).length : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa] flex">
      {/* Sidebar - Chat History */}
      <div className="w-64 bg-white border-r border-[#dadce0] flex flex-col">
        <div className="p-4 border-b border-[#dadce0]">
          <Button
            onClick={handleNewSession}
            className="w-full bg-[#4285f4] hover:bg-[#1557b0]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-[#f0f7ff] text-[#4285f4]'
                    : 'hover:bg-[#f8f9fa] text-[#5f6368]'
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs opacity-60">
                    {session.messages.length} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Library Info */}
        <div className="p-4 border-t border-[#dadce0] bg-[#f8f9fa]">
          <div className="flex items-center gap-2 text-sm text-[#5f6368]">
            <BookOpen className="w-4 h-4" />
            <span>{paperCount} papers in library</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#dadce0] p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-[#202124]">Research Assistant</h1>
              <p className="text-sm text-[#5f6368]">
                Ask questions about your saved research papers
              </p>
            </div>
            {ollamaAvailable === false && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Ollama Offline
              </Badge>
            )}
            {ollamaAvailable === true && (
              <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                ● Online
              </Badge>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {ollamaAvailable === false && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900 mb-2">Setup Required</h3>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p>To use the chatbot, install Ollama:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Download Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a></li>
                      <li>Run: <code className="bg-yellow-100 px-2 py-0.5 rounded">ollama pull phi3</code></li>
                      <li>Ollama will start automatically on port 11434</li>
                    </ol>
                    <p className="text-xs">Runs locally on your machine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto">
            {!currentSession || currentSession.messages.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-[#dadce0]" />
                <h2 className="text-xl font-medium text-[#202124] mb-2">
                  Start a conversation
                </h2>
                <p className="text-sm text-[#5f6368] mb-6">
                  Ask me anything about your research papers
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {[
                    'Summarize papers about neural networks',
                    'What methodologies are used?',
                    'Compare results across studies'
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example)}
                      className="p-4 bg-white border border-[#dadce0] rounded-lg hover:border-[#4285f4] hover:shadow-sm transition-all text-left"
                    >
                      <p className="text-sm text-[#5f6368]">{example}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {currentSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-[#4285f4] text-white'
                          : 'bg-white border border-[#dadce0] text-[#202124]'
                      }`}
                    >
                      <div 
                        className="text-sm whitespace-pre-wrap leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ 
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/^\u2022 /gm, '&bull; ')
                            .replace(/^(\d+\.) /gm, '<strong>$1</strong> ')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#dadce0]">
                          <p className="text-xs font-medium mb-2 opacity-75">Sources:</p>
                          <div className="space-y-1">
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="text-xs opacity-75 flex items-start gap-2">
                                <span className="font-medium">[{idx + 1}]</span>
                                <span className="flex-1">{source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs opacity-50 mt-2">
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
                    <div className="bg-white border border-[#dadce0] rounded-2xl px-5 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#5f6368]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-[#dadce0] p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  ollamaAvailable === false
                    ? 'Install Ollama to start chatting...'
                    : paperCount === 0
                    ? 'Save papers to your library first...'
                    : 'Ask a question about your papers...'
                }
                disabled={isLoading || ollamaAvailable === false || paperCount === 0}
                className="flex-1 h-12"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || ollamaAvailable === false || paperCount === 0}
                className="bg-[#4285f4] hover:bg-[#1557b0] h-12 px-6 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-[#5f6368] mt-2 text-center">
              AI-powered research assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
