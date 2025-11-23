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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Log received data
      console.log("✅ API Response received:", {
        response: data.response,
        moviesCount: data.movies?.length || 0,
        firstMovie: data.movies?.[0] ? {
          id: data.movies[0].id,
          title: data.movies[0].title,
          year: data.movies[0].year,
          rating: data.movies[0].rating,
          score: data.movies[0].score,
          poster: data.movies[0].poster?.substring(0, 50) || 'no poster'
        } : null
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I received your message!",
        sender: "ai",
        timestamp: new Date(),
        movies: data.movies || [],
      };
      
      // Debug: Log message with movies
      console.log("✅ AI Message created with movies:", aiMessage.movies?.length || 0);

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // More detailed error message
      const errorDetails = error instanceof Error ? error.message : String(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorDetails.includes("N8N webhook URL not configured") 
          ? "Configuration error: N8N webhook URL is not set. Please check your .env.local file."
          : errorDetails.includes("N8N request failed")
          ? "I'm having trouble connecting to my movie database. Please check that the n8n workflow is active."
          : "I'm having trouble connecting right now. Please try again in a moment.",
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
    <div className="flex flex-col h-full neo-glass rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Messages - Fixed height with internal scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
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
                        Found {message.movies.length} movie{message.movies.length > 1 ? 's' : ''} for you!{' '}
                        <span className="text-gray-500">(sorted by relevance)</span>
                      </span>
                    </div>
                    
                    {/* Best Match - Highlighted with Top 3 Medals */}
                    {message.movies.length > 0 && (() => {
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
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 1 }}
                                      className="text-gray-300 text-sm leading-relaxed line-clamp-4 mb-4"
                                    >
                                      {bestMatch.description}
                                    </motion.p>
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 1.1 }}
                                      className="flex flex-wrap gap-4 text-sm"
                                    >
                                      <motion.span
                                        className="flex items-center gap-2 text-gray-300"
                                        whileHover={{ scale: 1.05, x: 5 }}
                                      >
                                        <Calendar className="w-4 h-4 text-cinema-amber" />
                                        <span className="font-medium">{bestMatch.year}</span>
                                      </motion.span>
                                      <motion.span
                                        className="flex items-center gap-2 text-gray-300"
                                        whileHover={{ scale: 1.05, x: 5 }}
                                      >
                                        <Star className="w-4 h-4 fill-cinema-amber text-cinema-amber" />
                                        <span className="font-medium">{bestMatch.rating?.toFixed(1)}/10</span>
                                      </motion.span>
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
      </div>

      {/* Input Section */}
      <div className="border-t border-white/10 p-4 bg-black/20">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              // Trigger header fade out when input is focused
              onInputFocus?.();
            }}
            placeholder="Tell me what kind of movies you're in the mood for..."
            className="flex-1 bg-black/40 border-cinema-amber/20 text-white placeholder-gray-400 focus:border-cinema-amber focus:ring-cinema-amber focus:ring-2 focus:ring-cinema-amber/50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-cinema-amber hover:bg-cinema-gold text-cinema-dark"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 