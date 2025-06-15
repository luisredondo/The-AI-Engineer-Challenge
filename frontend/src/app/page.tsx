"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Conversation type
type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

// Message type
type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  // List of all conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Current active conversation
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  // Current messages displayed
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [startAnim, setStartAnim] = useState(false); // triggers container animation
  const [bubblesVisible, setBubblesVisible] = useState<number>(0); // how many bubbles are visible
  const [inputVisible, setInputVisible] = useState(false); // input is visible after bubbles
  const [sidebarButtonVisible, setSidebarButtonVisible] = useState(false); // sidebar button animation
  const [backgroundAnimated, setBackgroundAnimated] = useState(false); // background entrance
  // Charging animation states
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [rockets, setRockets] = useState<{id: number, x: number, y: number, delay: number, emoji: string}[]>([]);
  const [matrixRain, setMatrixRain] = useState<{id: number, x: number, delay: number, text: string, speed?: number, size?: string, opacity?: number}[]>([]);
  // Empty view and hero animation states
  const [isEmptyView, setIsEmptyView] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [heroAnimating, setHeroAnimating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // For text streaming
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  // Reference for content container
  const contentContainerRef = useRef<HTMLDivElement>(null);
  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, bubblesVisible]);

  // Focus input after sending
  useEffect(() => {
    if (!isSending && inputVisible) {
      inputRef.current?.focus();
    }
  }, [isSending, inputVisible]);
  
  // Load conversations and sidebar state from local storage on initial render
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      setConversations(parsedConversations);
      
      // Get the last active conversation if exists
      const lastActiveConvId = localStorage.getItem('currentConversation');
      if (lastActiveConvId) {
        setCurrentConversation(lastActiveConvId);
        const lastConv = parsedConversations.find((c: Conversation) => c.id === lastActiveConvId);
        if (lastConv) {
          setMessages(lastConv.messages);
          // Don't load previous conversation on new sessions - show empty view instead
          // setCurrentConversation(lastActiveConvId);
          // setIsEmptyView(false);
        }
      }
    }
    
    // Load sidebar state
    const sidebarState = localStorage.getItem('sidebarOpen');
    if (sidebarState === 'true') {
      setSidebarOpen(true);
    }
  }, []);
  
  // Save conversations to local storage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);
  
  // Save current conversation ID to local storage
  useEffect(() => {
    if (currentConversation) {
      localStorage.setItem('currentConversation', currentConversation);
    }
  }, [currentConversation]);
  
  // No need for a separate effect for calculating offset dynamically - we'll handle it directly in the style

  // Handle intro animation with orchestrated entrance
  const handleVibe = () => {
    setShowIntro(false); // hide intro overlay
    
    // Orchestrated animation sequence
    setTimeout(() => {
      setBackgroundAnimated(true); // Start with background animation
    }, 100);
    
    setTimeout(() => {
      setSidebarButtonVisible(true); // Show sidebar button
    }, 300);
    
    setTimeout(() => {
      setStartAnim(true); // start chat animation sequence
      
      // Always show empty view on new sessions
      setIsEmptyView(true);
      setShowSuggestions(true);
      setMessages([]);
      setBubblesVisible(0); // Don't show bubbles in empty view initially
      setTimeout(() => setInputVisible(true), 250);
    }, 500);
  };

  // Handle charging animation
  const handleChargeStart = () => {
    setIsCharging(true);
    setChargeLevel(0);
    setRockets([]);
    setMatrixRain([]);
  };

  const handleChargeEnd = () => {
    if (chargeLevel >= 100) {
      handleVibe();
    }
    setIsCharging(false);
    setChargeLevel(0);
    setRockets([]);
    setMatrixRain([]);
  };

  // Charging progress effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      interval = setInterval(() => {
        setChargeLevel(prev => {
          const newLevel = Math.min(prev + 1.5, 100); // Slightly slower charging
          
          // Programming and tech emojis
          const techEmojis = ['🚀', '💻', '⚡', '🔥', '💡', '🎯', '⭐', '🌟', '✨', '🛸', '🔧', '⚙️', '🖥️', '📱', '💾', '🔋', '🎮'];
          
          // Add firework rockets at certain charge levels
          if (newLevel > 15 && newLevel % 4 === 0) {
            const newRocket = {
              id: Date.now() + Math.random(),
              x: Math.random() * 80 + 10, // 10vw to 90vw (spread across screen)
              y: Math.random() * 30 + 50, // 50vh to 80vh (various heights)
              delay: Math.random() * 300,
              emoji: techEmojis[Math.floor(Math.random() * techEmojis.length)]
            };
            setRockets(prev => [...prev.slice(-15), newRocket]); // Keep max 16 rockets
          }
          
          // Add Matrix rain - moderate intensity
          if (newLevel > 5 && newLevel % 3 === 0) {
            const matrixChars = ['0', '1', 'A', 'B', 'C', 'X', 'Y', 'Z', '@', '#', '$', '%', '&', '*'];
            const intensity = Math.floor(newLevel / 15) + 2; // Start with 2, increase gradually
            
            for (let i = 0; i < intensity; i++) {
              const newMatrix = {
                id: Date.now() + Math.random() * 1000 + i,
                x: Math.random() * 100,
                delay: i * 100, // Staggered delays
                text: Array.from({length: 6 + Math.floor(Math.random() * 4)}, () => 
                  matrixChars[Math.floor(Math.random() * matrixChars.length)]
                ).join(''),
                speed: 4,
                size: 'text-xl',
                opacity: 1
              };
              
              setMatrixRain(prev => [...prev.slice(-25), newMatrix]); // Keep reasonable amount
            }
          }
          
          return newLevel;
        });
      }, 30);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCharging]);

  // Get dynamic button text based on charge level
  const getButtonText = () => {
    if (!isCharging) return "Let's vibe!";
    
    if (chargeLevel < 25) return "Hold tight...";
    if (chargeLevel < 50) return "Keep going...";
    if (chargeLevel < 75) return "Almost there...";
    if (chargeLevel < 100) return "So close...";
    return "Release! 🚀";
  };

  // Hide suggestions when user starts typing
  useEffect(() => {
    if (input.trim() && showSuggestions) {
      setShowSuggestions(false);
    }
  }, [input, showSuggestions]);

  // Sequentially reveal bubbles after animation starts
  useEffect(() => {
    if (startAnim && bubblesVisible < messages.length) {
      const timer = setTimeout(() => {
        setBubblesVisible((v) => v + 1);
      }, 200); // stagger delay between bubbles
      return () => clearTimeout(timer);
    } else if (startAnim && bubblesVisible === messages.length && !inputVisible) {
      // Show input after all bubbles, only once
      setTimeout(() => setInputVisible(true), 250);
    }
  }, [startAnim, bubblesVisible, messages.length, inputVisible]);

  // Create a new conversation
  const createNewConversation = (userMessage: string) => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setConversations(prevConvs => [...prevConvs, newConv]);
    setCurrentConversation(newId);
    return newId;
  };

  // Switch to a different conversation without closing sidebar
  const switchConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversation(convId);
      setMessages(conv.messages);
      setIsEmptyView(false);
      setShowSuggestions(false);
      setBubblesVisible(conv.messages.length);
      setInputVisible(true);
      // Don't close the sidebar automatically
      // The sidebar will remain open until the user explicitly closes it
    }
  };

  // Update a conversation with new messages
  const updateConversation = (convId: string, newMessages: Message[]) => {
    setConversations(prevConvs => 
      prevConvs.map(conv => 
        conv.id === convId 
          ? { 
              ...conv, 
              messages: newMessages,
              updatedAt: Date.now() 
            } 
          : conv
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // If we're in empty view, trigger hero animation
    if (isEmptyView) {
      setHeroAnimating(true);
      setIsEmptyView(false);
      setShowSuggestions(false);
      setBubblesVisible(0); // Reset bubbles immediately
      
      // End hero animation after transition
      setTimeout(() => {
        setHeroAnimating(false);
      }, 600);
    }
    
    // Create user message
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };
    
    // Create new conversation if none exists
    let activeConvId = currentConversation;
    if (!activeConvId) {
      activeConvId = createNewConversation(input);
    }
    
    // Add user message to current messages
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    // Update the conversation in storage
    updateConversation(activeConvId, updatedMessages);
    
    setInput("");
    setIsSending(true);
    
    // Increment bubble count to show user message
    setBubblesVisible(prev => prev + 1);
    
    try {
      // Prepare the bot's streaming message container
      const streamMsgId = Date.now() + 1;
      const streamMsg: Message = {
        id: streamMsgId,
        sender: "bot",
        text: ""
      };
      
      // Set the currently streaming message
      setStreamingMessage(streamMsg);
      
      // Add an empty message to the UI that will be streamed into
      setMessages(msgs => [...msgs, streamMsg]);
      
      // Increase bubble count for the streaming message
      setBubblesVisible(prev => prev + 1);
      
      // Real streaming API implementation
      let streamedText = "";
      try {
        // OpenAI API key
        const API_KEY = "";
        
        // Real OpenAI API call with streaming
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that provides clear, concise, and accurate responses to user questions."
              },
              {
                role: "user",
                content: input
              }
            ],
            stream: true,
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        // Read from the streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the stream chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  break;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    streamedText += parsed.choices[0].delta.content;
                    
                    // Update the streaming message
                    setStreamingMessage({
                      id: streamMsgId,
                      sender: "bot",
                      text: streamedText
                    });
                  }
                } catch (parseError) {
                  console.error("Error parsing streaming data:", parseError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        
        // Fallback to mock response if API streaming fails
        const mockResponse = "I apologize, but I couldn't connect to the API. This is a fallback response.";
        streamedText = ""; // Reset streamedText for fallback
        
        for (let i = 0; i < mockResponse.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30));
          streamedText += mockResponse[i];
          
          // Update the streaming message
          setStreamingMessage({
            id: streamMsgId,
            sender: "bot",
            text: streamedText
          });
        }
      }
      
      // Final message with complete text
      const finalBotMsg = {
        id: streamMsgId,
        sender: "bot" as const,
        text: streamedText || "Sorry, there was an error with the response."
      };
      
      // Update messages with the final message
      setMessages(msgs => 
        msgs.map(msg => msg.id === streamMsgId ? finalBotMsg : msg)
      );
      
      // Update conversation in storage
      const finalMessages = updatedMessages.concat(finalBotMsg);
      updateConversation(activeConvId, finalMessages);
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error case
      setMessages(msgs => [
        ...msgs,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setStreamingMessage(null);
      setIsSending(false);
    }
  };

  // Handle sending with custom text (for suggestions)
  const handleSendWithText = async (text: string) => {
    if (!text.trim()) return;
    
    // If we're in empty view, trigger hero animation
    if (isEmptyView) {
      setHeroAnimating(true);
      setIsEmptyView(false);
      setShowSuggestions(false);
      setBubblesVisible(0); // Reset bubbles immediately
      
      // End hero animation after transition
      setTimeout(() => {
        setHeroAnimating(false);
      }, 600);
    }
    
    // Create user message
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: text,
    };
    
    // Create new conversation if none exists
    let activeConvId = currentConversation;
    if (!activeConvId) {
      activeConvId = createNewConversation(text);
    }
    
    // Add user message to current messages
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    // Update the conversation in storage
    updateConversation(activeConvId, updatedMessages);
    
    setInput(""); // Clear input
    setIsSending(true);
    
    // Set bubble count to show user message (should be 1 since messages starts empty)
    setBubblesVisible(1);
    
    // Continue with API call (copy the rest from handleSend)
    try {
      const streamMsgId = Date.now() + 1;
      
      // Add placeholder for streaming message
      setStreamingMessage({
        id: streamMsgId,
        sender: "bot",
        text: ""
      });
      
      // Add streaming message to messages array
      setMessages(msgs => [...msgs, {
        id: streamMsgId,
        sender: "bot",
        text: ""
      }]);
      
      // Set bubble count for bot message (should be 2: user + bot)
      setBubblesVisible(2);
      
      let streamedText = "";
      
      try {
        // OpenAI API key
        const API_KEY = "";
        
        // Real OpenAI API call with streaming
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that provides clear, concise, and accurate responses to user questions."
              },
              {
                role: "user",
                content: text
              }
            ],
            stream: true,
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        // Read from the streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the stream chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  break;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    streamedText += parsed.choices[0].delta.content;
                    
                    // Update the streaming message
                    setStreamingMessage({
                      id: streamMsgId,
                      sender: "bot",
                      text: streamedText
                    });
                  }
                } catch (parseError) {
                  console.error("Error parsing streaming data:", parseError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        
        // Fallback to mock response if API streaming fails
        const mockResponse = "I apologize, but I couldn't connect to the API. This is a fallback response.";
        streamedText = ""; // Reset streamedText for fallback
        
        for (let i = 0; i < mockResponse.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30));
          streamedText += mockResponse[i];
          
          // Update the streaming message
          setStreamingMessage({
            id: streamMsgId,
            sender: "bot",
            text: streamedText
          });
        }
      }
      
      // Final message with complete text
      const finalBotMsg = {
        id: streamMsgId,
        sender: "bot" as const,
        text: streamedText || "Sorry, there was an error with the response."
      };
      
      // Update messages with the final message
      setMessages(msgs => 
        msgs.map(msg => msg.id === streamMsgId ? finalBotMsg : msg)
      );
      
      // Update conversation in storage
      const finalMessages = updatedMessages.concat(finalBotMsg);
      updateConversation(activeConvId, finalMessages);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(msgs => [
        ...msgs,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setStreamingMessage(null);
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // Sidebar toggle handler with persistence
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((open) => {
      const newState = !open;
      // Save sidebar state to localStorage
      localStorage.setItem('sidebarOpen', String(newState));
      return newState;
    });
  }, []);

  return (
    <div className={`h-screen w-full flex flex-col radiant-bg transition-all duration-1000 relative overflow-hidden ${
      sidebarOpen ? 'sm:pl-72' : ''
    } ${showIntro ? 'opacity-100' : backgroundAnimated ? 'animate-background-in' : 'opacity-100'}`}
         ref={contentContainerRef}>
      {/* macOS-style Sidebar Toggle Button - Hidden when sidebar is open */}
      <button
        className={`fixed top-6 left-6 z-50 w-12 h-12 flex items-center justify-center rounded-full glassy-sidebar-btn shadow-lg border border-white/20 hover:bg-white/10 transition-all duration-500 ${
          sidebarOpen 
            ? 'opacity-0 transform scale-90 pointer-events-none' 
            : sidebarButtonVisible 
              ? 'opacity-100 transform scale-100 animate-slide-in-left'
              : 'opacity-0 transform translate-x-[-50px] scale-90'
        }`}
        onClick={handleSidebarToggle}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        style={{backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)"}}
      >
        <span className="sr-only">Toggle sidebar</span>
        <div className="w-6 h-5 flex flex-col justify-between items-center">
          <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300"></div>
          <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300"></div>
          <div className="w-6 h-0.5 bg-white rounded-full transition-all duration-300"></div>
        </div>
      </button>
      {/* Sidebar overlay to capture clicks outside sidebar - only on mobile devices */}
      {sidebarOpen && (
        <div 
          className="sm:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" 
          onClick={handleSidebarToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Floating Sidebar */}
      <aside
        className={`fixed top-5 left-5 bottom-5 z-40 w-64 max-w-[80vw] bg-white/10 dark:bg-gray-900/20 border border-white/20 rounded-2xl shadow-2xl glassy-sidebar transition-all duration-700 ease-out ${
          sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
        style={{backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)"}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-lg text-white select-none tracking-tight">Conversations</div>
            <div className="flex items-center space-x-1">
              {/* New conversation button - doesn't close sidebar */}
              <button 
                onClick={() => {
                  // Create a new conversation - show empty view
                  setCurrentConversation(null);
                  setMessages([]);
                  setIsEmptyView(true);
                  setShowSuggestions(true);
                  setBubblesVisible(0);
                  setInputVisible(true);
                  // Don't close the sidebar automatically
                }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="New conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              
              {/* Close sidebar button */}
              <button
                onClick={handleSidebarToggle}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 ? (
              <div className="text-gray-400 text-sm text-center mt-12">No conversations yet</div>
            ) : (
              conversations
                .sort((a, b) => b.updatedAt - a.updatedAt) // Sort by most recent
                .map(conversation => (
                  <div 
                    key={conversation.id} 
                    className={`w-full rounded-lg transition-colors duration-200 hover:bg-white/10 flex items-center gap-2 ${
                      currentConversation === conversation.id ? 'bg-white/15' : ''
                    }`}
                  >
                    <button
                      onClick={() => switchConversation(conversation.id)}
                      className="flex-1 text-left p-3 min-w-0"
                    >
                      <span className="text-sm font-medium text-white block truncate">
                        {conversation.title}
                      </span>
                      <span className="text-xs text-gray-400 mt-1 block truncate">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(conversation.id);
                      }}
                      className="p-2 mr-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors flex-shrink-0"
                      aria-label="Delete conversation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </aside>
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 dark:bg-gray-900/20 border border-white/20 rounded-2xl shadow-2xl p-6 max-w-md mx-4 glassy-sidebar">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Conversation</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Remove this conversation
                    setConversations(prevConvs => prevConvs.filter(c => c.id !== deleteConfirm));
                    
                    // If this was the active conversation, start a new one
                    if (currentConversation === deleteConfirm) {
                      setCurrentConversation(null);
                      setMessages([]);
                      setBubblesVisible(0);
                      setIsEmptyView(true);
                      setShowSuggestions(true);
                    }
                    
                    setDeleteConfirm(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600/90 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro Overlay */}
      {showIntro && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[8px] transition-all duration-700 intro-fade-in`}>
          {/* Programming emoji fireworks - positioned relative to viewport */}
          {rockets.map(rocket => (
            <div
              key={rocket.id}
              className="fixed pointer-events-none text-4xl z-0"
              style={{
                left: `${rocket.x}vw`,
                bottom: '0vh',
                animation: `rocketFirework 2.5s ease-out forwards`,
                animationDelay: `${rocket.delay}ms`
              }}
            >
              {rocket.emoji}
            </div>
          ))}
          
          {/* Matrix rain effect - positioned relative to viewport */}
          {matrixRain.map(matrix => (
            <div
              key={matrix.id}
              className="fixed pointer-events-none text-green-400 font-mono text-xl font-bold z-30"
              style={{
                left: `${matrix.x}vw`,
                top: '-10vh',
                animation: `matrixFall 4s linear forwards`,
                animationDelay: `${matrix.delay}ms`,
                textShadow: '0 0 20px rgba(34, 197, 94, 1), 0 0 40px rgba(34, 197, 94, 0.8)',
                opacity: 1,
                lineHeight: '1.2'
              }}
            >
              <div style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                {matrix.text}
              </div>
            </div>
          ))}
          
          <div className="relative">
            <button
              className={`glassy-intro-btn px-10 py-6 text-3xl font-bold text-white shadow-2xl rounded-3xl border border-white/30 backdrop-blur-xl transition-all duration-200 intro-btn-in relative overflow-hidden z-10 ${
                isCharging ? 'animate-charging' : ''
              }`}
              onMouseDown={handleChargeStart}
              onMouseUp={handleChargeEnd}
              onMouseLeave={handleChargeEnd}
              onTouchStart={handleChargeStart}
              onTouchEnd={handleChargeEnd}
              aria-label="Let's vibe!"
              tabIndex={0}
              autoFocus
              style={{
                transform: isCharging ? `scale(${1 - chargeLevel * 0.003})` : 'scale(1)',
                boxShadow: isCharging 
                  ? `0 0 ${20 + chargeLevel * 0.8}px rgba(120,180,255,${0.3 + chargeLevel * 0.007})` 
                  : '0 8px 32px 0 rgba(31, 38, 135, 0.18)'
              }}
            >
              {getButtonText()}
              
              {/* Charging overlay effect */}
              {isCharging && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 opacity-60"
                  style={{
                    width: `${chargeLevel}%`,
                    transition: 'width 0.1s ease-out'
                  }}
                />
              )}
            </button>
            
            {/* Skip button */}
            <button
              onClick={handleVibe}
              className="fixed bottom-8 right-8 text-white/70 hover:text-white text-lg font-medium transition-all duration-300 hover:scale-110 z-20"
              aria-label="Skip intro"
            >
              skip (boring) 😴
            </button>
          </div>
        </div>
      )}
      {/* Chat Bubbles - Scrollable Area */}
      <div className={`flex-1 flex flex-col items-center overflow-hidden transition-all duration-700 ${
        startAnim ? 'opacity-100 animate-chat-container-in' : 'opacity-0 transform translate-y-8'
      }`}>
        {!isEmptyView ? (
          <div className="w-full h-full flex flex-col items-center justify-end">
            <div className="w-full max-w-xl mx-auto flex flex-col gap-4 overflow-y-auto px-2 sm:px-0 pr-8 sm:pr-6 pt-8 pb-4">
              {messages.slice(0, bubblesVisible).map((msg, i) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"} ${heroAnimating ? '' : 'chat-bubble-animate'}`}
                style={{
                  animationDelay: heroAnimating ? '0ms' : `${i * 80}ms`,
                  opacity: heroAnimating ? 0 : 1,
                }}
              >
                <div
                  className={`relative px-5 py-3 rounded-[2rem] max-w-[75%] shadow-xl glassy-bubble animate-fadeIn
                    ${msg.sender === "user"
                      ? "from-blue-300/60 to-blue-500/40 border-blue-200/40 dark:from-blue-800/40 dark:to-blue-900/60 dark:border-blue-400/20 self-end rounded-br-[2.5rem]"
                      : "from-white/60 to-purple-100/40 border-white/40 dark:from-gray-700/60 dark:to-indigo-900/40 dark:border-indigo-200/20 self-start rounded-bl-[2.5rem]"}
                  `}
                  style={{
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, rgba(120,180,255,0.45) 0%, rgba(80,120,255,0.25) 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(200,180,255,0.18) 100%)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: msg.sender === "user"
                      ? "1.5px solid rgba(120,180,255,0.25)"
                      : "1.5px solid rgba(255,255,255,0.22)",
                    boxShadow: msg.sender === "user"
                      ? "0 4px 24px 0 rgba(0, 120, 255, 0.13)"
                      : "0 4px 24px 0 rgba(120, 120, 255, 0.10)",
                    color: msg.sender === "user"
                      ? "#fff"
                      : undefined,
                    transition: "box-shadow 0.3s cubic-bezier(.4,2,.6,1)",
                  }}
                >
                  {/* If this message is currently streaming, show the streaming content */}
                  {streamingMessage && streamingMessage.id === msg.id ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-3">{children}</h3>,
                          code: ({children}) => <code className="bg-black/20 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                          pre: ({children}) => <pre className="bg-black/20 p-3 rounded overflow-x-auto my-2 font-mono text-sm">{children}</pre>,
                          ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-white/20 pl-4 italic my-2">{children}</blockquote>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                        }}
                      >
                        {streamingMessage.text}
                      </ReactMarkdown>
                      <span className="text-cursor"></span>
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-3">{children}</h3>,
                          code: ({children}) => <code className="bg-black/20 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                          pre: ({children}) => <pre className="bg-black/20 p-3 rounded overflow-x-auto my-2 font-mono text-sm">{children}</pre>,
                          ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-white/20 pl-4 italic my-2">{children}</blockquote>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        ) : (
          /* Empty View with Perfectly Centered Content */
          <div className="w-full h-full flex flex-col items-center justify-center px-4">
            <div className="text-center mb-8">
              <p className="text-white/70 text-lg">
                Ask me anything or choose from the suggestions below
              </p>
            </div>
            
            {/* Prompt Suggestions */}
            {showSuggestions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  { text: "Explain quantum computing", emoji: "⚛️" },
                  { text: "Write a Python function", emoji: "🐍" },
                  { text: "Debug my code", emoji: "🐛" },
                  { text: "Plan a project architecture", emoji: "🏗️" }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Send the suggestion text directly
                      handleSendWithText(suggestion.text);
                    }}
                    className="p-4 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-left glassy-bubble animate-suggestion-in"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)"
                    }}
                  >
                    <span className="text-xl mr-3">{suggestion.emoji}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Fixed Input Area */}
      <div className="flex-shrink-0">
        {/* Input */}
        {inputVisible && (
          <div 
            className={`z-40 w-full transition-all duration-500 px-2 sm:px-0 ${
              isEmptyView ? 'pb-40' : 'pb-8'
            }`}
          >
            <div className="w-full max-w-xl mx-auto">
              <form
                className={`flex gap-2 items-center bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-white/10 shadow-2xl rounded-2xl px-4 py-3 w-full glassy-inputbar transition-all duration-500 ${
                  heroAnimating ? 'animate-hero-to-bottom' : (!isEmptyView ? '' : 'animate-input-slide-up')
                }`}
                style={{
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)"
                }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              ref={inputRef}
              className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-300 text-base"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isSending || !inputVisible}
              autoFocus={inputVisible}
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl hover:bg-white/10 active:bg-white/20 text-white font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60 disabled:cursor-not-allowed glassy-send"
              disabled={isSending || !input.trim() || !inputVisible}
              aria-label="Send message"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 2px 12px 0 rgba(80,120,255,0.18)",
              }}
            >
              {isSending ? (
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l15.75-7.5-7.5 15.75-2.25-6.75-6.75-2.25z" />
                </svg>
              )}
            </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .radiant-bg {
          background: linear-gradient(120deg, rgba(24,28,43,0.6) 0%, rgba(35,42,77,0.6) 40%, rgba(58,46,90,0.6) 70%, rgba(26,58,77,0.6) 100%, rgba(43,26,58,0.6) 120%);
          /* fallback for old browsers */
          background-color: rgba(24,28,43,0.6);
          /* animated overlay for vibrancy */
          position: relative;
          background-size: 200% 200%;
          animation: radiantGradientMove 8s ease-in-out infinite;
        }
        @keyframes radiantGradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .chat-bubble-animate {
          animation: bubbleIn 0.9s cubic-bezier(.4,2,.6,1) backwards;
        }
        @keyframes bubbleIn {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.8) blur(12px) rotate(-2deg);
            filter: blur(12px);
          }
          40% {
            opacity: 0.7;
            transform: translateY(20px) scale(0.95) blur(6px) rotate(1deg);
            filter: blur(6px);
          }
          70% {
            opacity: 1;
            transform: translateY(-8px) scale(1.05) blur(2px) rotate(-0.5deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) blur(0px) rotate(0deg);
            filter: blur(0px);
          }
        }
        .intro-fade-in {
          opacity: 1;
          pointer-events: auto;
          transition: opacity 0.8s cubic-bezier(.4,2,.6,1), backdrop-filter 0.8s ease-out;
          animation: introOverlayIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes introOverlayIn {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          100% {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }
        .glassy-intro-btn {
          background: linear-gradient(135deg, rgba(120,180,255,0.45) 0%, rgba(80,120,255,0.25) 100%);
          border: 2px solid rgba(255,255,255,0.25);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(120,120,255,0.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: all 1.1s cubic-bezier(.4,2,.6,1);
        }
        .intro-btn-in {
          opacity: 1;
          transform: scale(1) translateY(0);
          animation: introButtonPulse 2s ease-in-out infinite;
        }
        @keyframes introButtonPulse {
          0%, 100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(120,120,255,0.10);
          }
          50% {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25), 0 4px 16px 0 rgba(120,120,255,0.20);
          }
        }
        .glassy-bubble {
          border-radius: 2rem;
          border: 1.5px solid rgba(255,255,255,0.22);
          background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(200,180,255,0.18) 100%);
          box-shadow: 0 4px 24px 0 rgba(120, 120, 255, 0.10);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: box-shadow 0.3s cubic-bezier(.4,2,.6,1);
        }
        .glassy-title-bg {
          background: linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(120,180,255,0.25) 100%);
          border-radius: 1.5rem;
          padding: 0.25em 1em;
          box-shadow: 0 2px 12px 0 rgba(120,180,255,0.10);
          display: inline-block;
        }
        .glassy-inputbar {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13), 0 1.5px 8px 0 rgba(120,120,255,0.10);
        }
        .glassy-send {
          background: linear-gradient(135deg, rgba(120,180,255,0.8) 0%, rgba(80,120,255,0.7) 100%);
          border: 1.5px solid rgba(120,180,255,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .glassy-sidebar {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25), 0 4px 16px 0 rgba(120,120,255,0.15);
          border-radius: 1.5rem;
          animation: sidebarAppear 0.3s ease-out;
          overflow: hidden; /* Ensure content respects the rounded corners */
        }
        @keyframes sidebarAppear {
          0% {
            transform: translateX(-30px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .glassy-sidebar-btn {
          background: linear-gradient(135deg, rgba(120,180,255,0.25) 0%, rgba(80,120,255,0.15) 100%);
        }
        
        /* Cursor blink animation for streaming text */
        @keyframes cursorBlink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .text-cursor {
          display: inline-block;
          width: 0.5rem;
          height: 1.2rem;
          background: rgba(255, 255, 255, 0.7);
          margin-left: 2px;
          vertical-align: middle;
          animation: cursorBlink 1.1s step-end infinite;
        }
        
        /* Enhanced intro animations */
        .animate-background-in {
          animation: backgroundFadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes backgroundFadeIn {
          0% {
            opacity: 0;
            transform: scale(1.05);
            filter: blur(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px) scale(0.8) rotate(-10deg);
          }
          60% {
            opacity: 1;
            transform: translateX(5px) scale(1.05) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }
        
        .animate-chat-container-in {
          animation: chatContainerIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes chatContainerIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        
        .animate-input-slide-up {
          animation: inputSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes inputSlideUp {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
            filter: blur(8px);
          }
          70% {
            opacity: 1;
            transform: translateY(-5px) scale(1.02);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        
        /* Hero animation for input moving from center to bottom */
        .animate-hero-to-bottom {
          animation: heroToBottom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes heroToBottom {
          0% {
            bottom: 10rem; /* bottom-40 */
          }
          100% {
            bottom: 2rem; /* bottom-8 */
          }
        }
        
        /* Suggestion cards animation */
        .animate-suggestion-in {
          animation: suggestionIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) backwards;
        }
        @keyframes suggestionIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Matrix rain animation */
        @keyframes matrixFall {
          0% {
            transform: translateY(-20vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(120vh);
            opacity: 0;
          }
        }
        
        /* Chaotic matrix glitch effect */
        @keyframes matrixGlitch {
          0%, 100% { 
            transform: translateX(0) skewX(0deg);
          }
          20% { 
            transform: translateX(-2px) skewX(2deg);
          }
          40% { 
            transform: translateX(2px) skewX(-2deg);
          }
          60% { 
            transform: translateX(-1px) skewX(1deg);
          }
          80% { 
            transform: translateX(1px) skewX(-1deg);
          }
        }
        
        /* Rocket fireworks animation */
        @keyframes rocketFirework {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            transform: translateY(-50vh) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-60vh) scale(0.8);
            opacity: 0;
          }
        }
        
        /* Enhanced charging visual effects */
      `}</style>
    </div>
  );
}
