"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Film, Calendar, Star, Users } from "lucide-react";
import MovieCard from "./MovieCard";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  movies?: Movie[];
}

interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string | null;
  description: string;
  rating: number;
  score?: number;
  backdrop_path?: string | null;
  vote_count?: number;
  tmdb_available?: boolean;
}

// Funny cinema phrases for when no movies are found
const NO_MOVIES_PHRASES = [
  "🎬 OMG! No movies to fill your requirements! Let's try again with a different mood!",
  "🍿 The reel came up empty! Let's rewind and try a different genre!",
  "🎥 Cut! No matches found. Let's do another take with different criteria!",
  "🎭 The curtain closed with no show! Let's change the script and try again!",
  "🎞️ The film strip broke! No movies matched. Let's splice in a new request!",
  "🎪 The circus left town empty-handed! Let's try a different act!",
  "🎨 The canvas is blank! No movies painted the picture. Let's try new colors!",
  "🎬 Director's cut: No movies in the final edit! Let's reshoot with new requirements!",
  "🍿 Popcorn's ready but no show! Let's change the program!",
  "🎥 The projector is running but the reel is empty! Let's load a new request!",
];

// 35 funny cinema phrases to show while loading (in English)
const CINEMA_LOADING_PHRASES = [
  "🎬 Reviewing my film collection...",
  "🍿 Preparing popcorn while searching...",
  "🎥 Consulting my cinematic database...",
  "🎭 Asking actors for recommendations...",
  "🎞️ Rewinding the best scenes...",
  "🎪 Reviewing the classics catalog...",
  "🎨 Looking for films with great lighting...",
  "🎬 Consulting with cinematographers...",
  "🍿 Popcorn is ready, now for the movies...",
  "🎥 Checking what's in theaters...",
  "🎭 Actors are rehearsing their recommendations...",
  "🎞️ Unrolling the best reels...",
  "🎪 Reviewing my favorites list...",
  "🎨 Searching for films with great art direction...",
  "🎬 Consulting the scripts of the best stories...",
  "🍿 Popcorn is popping, movies are loading...",
  "🎥 Reviewing credits of the best films...",
  "🎭 Actors are in the dressing room preparing...",
  "🎞️ Searching my classics archive...",
  "🎪 Checking which films have the best soundtrack...",
  "🎨 Consulting with costume designers...",
  "🎬 Reviewing the best shots...",
  "🍿 Popcorn is crispy, movies are ready...",
  "🎥 Looking for Oscar-worthy films...",
  "🎭 Actors are reading the script...",
  "🎞️ Unrolling the most exciting reels...",
  "🎪 Reviewing my cult collection...",
  "🎨 Searching for films with great cinematography...",
  "🎬 Consulting with editors...",
  "🍿 Preparing the perfect movie and snack combo...",
  "🎥 Reviewing the best sequences...",
  "🎭 Actors are rehearsing their best moments...",
  "🎞️ Searching my archive of cinematic gems...",
  "🎪 Checking which films have the best pacing...",
  "🎨 Consulting with special effects makeup artists...",
];

interface ChatProps {
  onInputFocus?: () => void;
}

export default function Chat({ onInputFocus }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "🎬 Welcome to your private screening room! I'm your personal movie curator. Tell me what kind of films you're in the mood for, and I'll recommend some hidden gems and classics that match your taste.",
      sender: "ai",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cambiar frase de loading aleatoriamente cada 2 segundos mientras está cargando
  useEffect(() => {
    if (!isTyping) {
      setLoadingPhrase("");
      return;
    }

    // Mostrar primera frase inmediatamente
    const randomPhrase = CINEMA_LOADING_PHRASES[Math.floor(Math.random() * CINEMA_LOADING_PHRASES.length)];
    setLoadingPhrase(randomPhrase);

    // Cambiar frase cada 2 segundos
    const interval = setInterval(() => {
      const newPhrase = CINEMA_LOADING_PHRASES[Math.floor(Math.random() * CINEMA_LOADING_PHRASES.length)];
      setLoadingPhrase(newPhrase);
    }, 2000);

    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Send message to N8N via API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const responseText = await response.text();
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              // If JSON parsing fails, use the text as error message
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (textError) {
          // If reading response fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Extract error message from errorData if available
        if (errorData && typeof errorData === 'object') {
          errorMessage = errorData.error || errorData.details || errorData.message || errorMessage;
        }
        
        // Safe error logging - only log if there's meaningful data
        if (Object.keys(errorData).length > 0 || response.statusText) {
          console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            ...(Object.keys(errorData).length > 0 && { data: errorData })
          });
        } else {
          console.error("API Error:", `HTTP ${response.status}: ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Check if no movies were received - safe check
      const movies = Array.isArray(data.movies) ? data.movies : [];
      const moviesCount = movies.length;
      const hasMovies = moviesCount > 0;
      const responseText = typeof data.response === 'string' ? data.response : '';

      // Debug: Log received data (safely)
      console.log("✅ API Response received:", {
        response: responseText,
        moviesCount: moviesCount,
        firstMovie: hasMovies && movies[0] ? {
          id: movies[0].id,
          title: movies[0].title,
          year: movies[0].year,
          rating: movies[0].rating,
          score: movies[0].score,
          poster: movies[0].poster?.substring(0, 50) || 'no poster'
        } : null
      });

      // If no movies, show special funny message
      const messageText = hasMovies 
        ? (responseText || "I received your message!")
        : NO_MOVIES_PHRASES[Math.floor(Math.random() * NO_MOVIES_PHRASES.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: "ai",
        timestamp: new Date(),
        movies: movies,
      };
      
      // Debug: Log message with movies
      console.log("✅ AI Message created with movies:", aiMessage.movies?.length || 0);

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // More detailed error message with cinema humor
      const errorDetails = error instanceof Error ? error.message : String(error);
      let errorText = "I'm having trouble connecting right now. Please try again in a moment.";
      
      if (errorDetails.includes("N8N webhook URL not configured")) {
        errorText = "🎬 Configuration error: My movie database connection is missing! Please check your .env.local file.";
      } else if (errorDetails.includes("N8N request failed")) {
        errorText = "🍿 The projector broke! I'm having trouble connecting to my movie database. Please check that the n8n workflow is active.";
      } else if (errorDetails.includes("fetch") || errorDetails.includes("network")) {
        errorText = "🎥 Network error: The film reel got stuck! Please check your connection and try again.";
      } else if (errorDetails.includes("timeout")) {
        errorText = "⏱️ The movie is running late! Request timed out. Please try again.";
      } else {
        errorText = "🎭 Something went wrong behind the scenes! Please try again in a moment.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div 
      className="flex flex-col neo-glass rounded-2xl overflow-hidden shadow-2xl chat-container md:h-full"
      animate={{
        height: isInputFocused && isMobile ? '50vh' : isMobile ? '90vh' : '100%',
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Chat Messages - Fixed height with internal scroll, adjusts for mobile keyboard */}
      <motion.div 
        className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 md:pb-6"
        animate={{
          paddingBottom: !isInputFocused && isMobile ? '10%' : isMobile ? '1rem' : '1.5rem',
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                message.sender === "user" ? "message-user" : "message-ai"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.sender === "ai" && (
                    <Film className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.sender === "ai" ? "CineAI" : "You"}
                  </span>
                </div>
                {/* Only show message text if there are no movies (to avoid duplication) */}
                {(!message.movies || message.movies.length === 0) && (
                  <p className="text-sm md:text-base leading-relaxed">
                    {message.text}
                  </p>
                )}
                
                {/* Movie Recommendations */}
                {message.movies && message.movies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-6"
                  >
                    <div className="mb-4 text-sm text-gray-300">
                      <span>
                        Found {message.movies?.length || 0} movie{(message.movies?.length || 0) > 1 ? 's' : ''} for you!{' '}
                        <span className="text-gray-500">(sorted by relevance)</span>
                      </span>
                    </div>
                    
                    {/* Best Match - Highlighted with Top 3 Medals */}
                    {message.movies && message.movies.length > 0 && (() => {
                      const sortedMovies = [...message.movies].sort((a, b) => (b.score || 0) - (a.score || 0));
                      const bestMatch = sortedMovies[0];
                      const otherMovies = sortedMovies.slice(1);
                      
                      return (
                        <>
                          {/* Best Match Section with enhanced animations */}
                          {bestMatch && bestMatch.title && (
                            <motion.div
                              initial={{ opacity: 0, y: 30, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ 
                                delay: 0.6, 
                                duration: 0.6,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                              }}
                              className="mb-8 relative"
                            >
                              {/* Glow effect for Best Match */}
                              <div className="absolute -inset-1 bg-gradient-to-r from-cinema-amber/20 via-cinema-gold/20 to-cinema-amber/20 rounded-lg blur-xl opacity-50" />
                              
                              <div className="relative mb-4">
                                <motion.div
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.7 }}
                                  className="text-sm text-cinema-amber font-semibold flex items-center gap-2"
                                >
                                  <span className="bg-gradient-to-r from-cinema-amber to-cinema-gold bg-clip-text text-transparent">
                                    Best Match - Top Recommendation
                                  </span>
                                </motion.div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div
                                  initial={{ x: -30, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                                  className="md:col-span-1"
                                >
                                  <MovieCard movie={bestMatch} isBestMatch={true} rank={1} />
                                </motion.div>
                                
                                <motion.div
                                  initial={{ x: 30, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
                                  className="md:col-span-2 hidden md:flex items-start"
                                >
                                  <div className="w-full p-6 bg-gradient-to-br from-black/40 via-black/30 to-black/40 rounded-lg border border-cinema-amber/30 backdrop-blur-sm shadow-lg shadow-cinema-amber/10 hover:shadow-cinema-amber/20 transition-all duration-300">
                                    <motion.h3
                                      className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                                      style={{
                                        background: 'linear-gradient(to right, var(--cinema-amber), var(--cinema-gold))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        color: 'transparent'
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      {bestMatch.title}
                                    </motion.h3>
                                    {bestMatch.description && (
                                      <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="text-gray-300 text-sm leading-relaxed line-clamp-4 mb-4"
                                      >
                                        {bestMatch.description}
                                      </motion.p>
                                    )}
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 1.1 }}
                                      className="flex flex-wrap gap-4 text-sm"
                                    >
                                      {bestMatch.year && (
                                        <motion.span
                                          className="flex items-center gap-2 text-gray-300"
                                          whileHover={{ scale: 1.05, x: 5 }}
                                        >
                                          <Calendar className="w-4 h-4 text-cinema-amber" />
                                          <span className="font-medium">{bestMatch.year}</span>
                                        </motion.span>
                                      )}
                                      {bestMatch.rating && (
                                        <motion.span
                                          className="flex items-center gap-2 text-gray-300"
                                          whileHover={{ scale: 1.05, x: 5 }}
                                        >
                                          <Star className="w-4 h-4 fill-cinema-amber text-cinema-amber" />
                                          <span className="font-medium">{bestMatch.rating.toFixed(1)}/10</span>
                                        </motion.span>
                                      )}
                                      {bestMatch.vote_count && (
                                        <motion.span
                                          className="flex items-center gap-2 text-gray-300"
                                          whileHover={{ scale: 1.05, x: 5 }}
                                        >
                                          <Users className="w-4 h-4 text-cinema-amber" />
                                          <span className="font-medium">{bestMatch.vote_count.toLocaleString()} votes</span>
                                        </motion.span>
                                      )}
                                    </motion.div>
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Other Movies Grid with staggered animations and Top 2-3 Medals */}
                          {otherMovies.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.2 }}
                              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2"
                            >
                              {otherMovies.map((movie, index) => (
                                <motion.div
                                  key={movie.id}
                                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  transition={{ 
                                    delay: 1.3 + index * 0.08, 
                                    duration: 0.4,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20
                                  }}
                                  whileHover={{ y: -5 }}
                                >
                                  <MovieCard 
                                    movie={movie} 
                                    isBestMatch={false}
                                    rank={index < 2 ? index + 2 : undefined} // rank 2 and 3 for next two movies
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator with Random Cinema Phrases */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="message-ai">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span className="text-xs opacity-75">CineAI</span>
              </div>
              {loadingPhrase && (
                <motion.p
                  key={loadingPhrase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-gray-300 mb-2 italic"
                >
                  {loadingPhrase}
                </motion.p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input Section - Fixed at bottom, always visible on mobile */}
      <div className="relative border-t border-white/10 bg-gradient-to-t from-black/60 via-black/40 to-black/20 flex-shrink-0 safe-area-inset-bottom input-section rounded-b-2xl">
        {/* Decorative top border with glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cinema-amber/50 to-transparent" />
        
        {/* Main input container with improved padding */}
        <div className="p-4 md:p-5 pb-6 md:pb-5">
          <div className="flex gap-3 items-center">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={(e) => {
                // Trigger header fade out when input is focused
                onInputFocus?.();
                // Set input focused state for mobile layout adjustment
                setIsInputFocused(true);
                // On mobile, ensure input stays visible when keyboard appears
                if (isMobile) {
                  setTimeout(() => {
                    const input = e.target as HTMLElement;
                    // Scroll input container into view
                    input.closest('.flex-shrink-0')?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'end',
                      inline: 'nearest'
                    });
                  }, 300);
                }
              }}
              onBlur={() => {
                // Reset input focused state when input loses focus
                setIsInputFocused(false);
              }}
              placeholder="Tell me what kind of movies you're in the mood for..."
              className="flex-1 bg-black/50 border-cinema-amber/30 text-white placeholder-gray-400 focus:border-cinema-amber focus:ring-cinema-amber focus:ring-2 focus:ring-cinema-amber/50 focus:bg-black/60 text-base md:text-sm h-12 md:h-10 rounded-xl shadow-lg shadow-black/20 transition-all duration-200"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-cinema-amber hover:bg-cinema-gold text-cinema-dark flex-shrink-0 h-12 md:h-10 w-12 md:w-10 p-0 rounded-xl shadow-lg shadow-cinema-amber/20 hover:shadow-cinema-amber/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
        
        {/* Bottom decorative gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
} 