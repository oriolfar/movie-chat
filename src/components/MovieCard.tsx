"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Calendar, Film, Users, X as XIcon } from "lucide-react";
import Image from "next/image";

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

interface MovieCardProps {
  movie: Movie;
  isBestMatch?: boolean;
  rank?: number; // 1, 2, or 3 for top 3 movies
}

export default function MovieCard({ movie, isBestMatch = false, rank }: MovieCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -12, scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="group cursor-pointer relative"
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Medal Badge for top 3 movies */}
        <AnimatePresence>
          {rank && rank <= 3 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute -top-2 -left-2 z-20"
            >
              <Badge className={`font-bold text-lg shadow-lg ${
                rank === 1 
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-yellow-900 shadow-yellow-500/50' 
                  : rank === 2
                  ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 text-gray-800 shadow-gray-400/50'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-amber-100 shadow-amber-700/50'
              }`}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Card className={`neo-glass transition-all duration-300 overflow-hidden backdrop-blur-md h-full p-0 ${
          isBestMatch 
            ? 'border-2 border-cinema-amber/80 hover:border-cinema-gold bg-gradient-to-br from-black/50 to-cinema-amber/10 shadow-lg shadow-cinema-amber/20' 
            : 'border-0 bg-black/40'
        }`}>
          {/* Poster Section - Full card with title overlay, no gaps */}
          <div className="relative w-full h-full aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
            {movie.poster ? (
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                  unoptimized={movie.poster.includes('image.tmdb.org')}
                  priority={isBestMatch}
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                {/* Gradient overlay for title readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </motion.div>
            ) : (
              <motion.div 
                className="w-full h-full flex items-center justify-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Film className="w-16 h-16 text-cinema-amber/40" />
              </motion.div>
            )}
            
            {/* Title Overlay - Bottom 
                - For Best Match (#1): hidden on desktop (title shown in info card), visible on mobile
                - For other movies (2,3,4,5): always visible (both desktop and mobile) */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 z-20 ${isBestMatch ? 'md:hidden' : ''}`}>
              <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 drop-shadow-lg">
                {movie.title}
              </h3>
            </div>
            
            {/* Rating Badge - Top Right with animation */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute top-2 right-2 z-10"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge className="bg-gradient-to-r from-cinema-amber to-yellow-500 text-cinema-dark hover:from-cinema-amber hover:to-yellow-600 border-0 shadow-lg shadow-amber-500/30">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {movie.rating?.toFixed(1) || 'N/A'}
                      </Badge>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">TMDB Rating: {movie.rating?.toFixed(1) || 'N/A'}/10</p>
                    {movie.vote_count && (
                      <p className="text-xs text-gray-400 mt-1">
                        {movie.vote_count.toLocaleString()} {movie.vote_count === 1 ? 'vote' : 'votes'}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Detail Modal with backdrop image and fade overlay */}
      <AnimatePresence>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 border-cinema-amber/40 backdrop-blur-xl shadow-2xl bg-transparent mobile-slide-down" showCloseButton={true}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              {/* Backdrop Image - Full modal background with smooth gradient blur to sharp */}
              {movie.backdrop_path && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <div className="relative w-full h-full">
                    {/* Base sharp image */}
                    <Image
                      src={movie.backdrop_path}
                      alt={`${movie.title} backdrop`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      unoptimized={movie.backdrop_path.includes('image.tmdb.org')}
                      priority
                      style={{ objectPosition: 'center center' }}
                    />
                    {/* Smooth gradient blur - less blur at top, more blur at bottom (only on background) */}
                    {/* Layer 1: Light blur at top (0-30%) */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.6) 25%, transparent 35%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.6) 25%, transparent 35%)',
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                    {/* Layer 2: Medium blur (25-55%) */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        maskImage: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0.9) 50%, transparent 60%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0.9) 50%, transparent 60%)',
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                    {/* Layer 3: Strong blur at bottom (50-100%) */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        maskImage: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.8) 70%, black 85%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.8) 70%, black 85%, black 100%)',
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                    {/* Gradient overlay for readability - covers entire modal */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
                {/* Mobile Close Button - Visible only on mobile */}
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="md:hidden absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all duration-200 shadow-lg"
                  aria-label="Close"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                
                {/* Top section with backdrop visible and title */}
                <div className="flex-shrink-0 p-6 pb-4 relative">
                  <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                      <motion.div
                        className="flex-1"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <DialogTitle className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                          {movie.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-200 text-base flex items-center gap-2 drop-shadow-lg">
                          <Calendar className="w-4 h-4 text-cinema-amber" />
                          <span>{movie.year}</span>
                          {movie.vote_count && (
                            <>
                              <span className="text-gray-400">•</span>
                              <Users className="w-4 h-4 text-cinema-amber" />
                              <span>{movie.vote_count.toLocaleString()} votes</span>
                            </>
                          )}
                        </DialogDescription>
                      </motion.div>
                      <div className="flex items-center gap-3">
                        {/* Rating Badge on header */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <Badge className="bg-gradient-to-r from-cinema-amber to-yellow-500 text-cinema-dark shadow-lg shadow-amber-500/30">
                            <Star className="w-4 h-4 mr-1 fill-current" />
                            {movie.rating?.toFixed(1) || 'N/A'}/10
                          </Badge>
                        </motion.div>
                        <AnimatePresence>
                          {rank && rank <= 3 && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <Badge className={`font-bold text-lg shadow-lg ${
                                rank === 1 
                                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-yellow-900 shadow-yellow-500/50' 
                                  : rank === 2
                                  ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 text-gray-800 shadow-gray-400/50'
                                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-amber-100 shadow-amber-700/50'
                              }`}>
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </DialogHeader>
                </div>

                {/* Bottom section - scrollable content (no blur on content, only on background) */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Poster Section - Clean, no fade */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl group"
                      >
                        {movie.poster ? (
                          <motion.div
                            className="relative w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={movie.poster}
                              alt={`${movie.title} poster`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized={movie.poster.includes('image.tmdb.org')}
                            />
                          </motion.div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-24 h-24 text-cinema-amber/40" />
                          </div>
                        )}
                      </motion.div>

                      {/* Details Section */}
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="space-y-5"
                      >
                        {/* Description */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <h4 className="text-cinema-amber font-semibold mb-3 text-lg flex items-center gap-2">
                            <Film className="w-5 h-5" />
                            Synopsis
                          </h4>
                          <p className="text-gray-300 leading-relaxed text-base">
                            {movie.description || "No description available."}
                          </p>
                        </motion.div>

                        {/* Additional Info */}
                        {movie.tmdb_available === false && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pt-4 border-t border-gray-800"
                          >
                            <Badge variant="outline" className="text-xs border-cinema-amber/30">
                              Limited information available
                            </Badge>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  );
}
