"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chat from "@/components/Chat";

export default function Home() {
  const [showHeader, setShowHeader] = useState(true);

  const handleInputFocus = () => {
    // Hide header when user starts typing
    if (showHeader) {
      setShowHeader(false);
    }
  };

  return (
    <div className="h-[100dvh] md:h-screen flex flex-col overflow-hidden">
      {/* Header - disappears when user focuses on input */}
      <AnimatePresence mode="wait">
        {showHeader && (
          <motion.header
            initial={{ opacity: 0, y: -20, height: "auto" }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ 
              opacity: 0, 
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0,
              overflow: "hidden"
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center py-8 md:py-12 flex-shrink-0"
          >
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold glow-amber mb-4 fade-in">
                CineAI
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4 fade-in">
                Your Private Movie Curator
              </p>
              <p className="text-sm md:text-base text-gray-400 mt-2 fade-in">
                Step into your personal screening room and discover films curated just for you
              </p>
            </motion.div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Chat Interface - expands to fill remaining space */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-0 md:pb-4 pt-4 min-h-0 overflow-hidden">
        <Chat onInputFocus={handleInputFocus} />
      </main>
    </div>
  );
}
