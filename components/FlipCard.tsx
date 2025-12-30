import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { CardData } from '../types';
import { cn } from '../utils';

interface FlipCardProps {
  card: CardData;
}

export const FlipCard: React.FC<FlipCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const handleFlip = () => {
    if (!isExpanded) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the flip
    setIsExpanded(true);
  };

  const toggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };

  return (
    <>
      <div 
        className="relative h-80 w-full cursor-pointer perspective-1000 group/card"
        onClick={handleFlip}
      >
        <motion.div
          className="w-full h-full relative transform-style-3d transition-all duration-500"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front Face */}
          <div 
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl",
              "bg-gradient-to-br from-indigo-500 to-purple-600",
              "flex items-center justify-center border-4 border-white/20"
            )}
          >
            <span className="text-8xl font-bold text-white drop-shadow-md select-none font-mono">
              {card.displayNumber}
            </span>
            
            <div className="absolute bottom-4 text-white/60 text-xs tracking-wider uppercase">
              Click to Reveal
            </div>
          </div>

          {/* Back Face */}
          <div 
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl overflow-hidden rotate-y-180",
              "bg-white border border-gray-100"
            )}
          >
            {/* Full size image background */}
            <div className="absolute inset-0">
               <img 
                 src={card.imageSrc} 
                 alt={card.title} 
                 className="w-full h-full object-cover"
                 loading="lazy"
                 referrerPolicy="no-referrer"
                 crossOrigin="anonymous"
               />
               {/* Overlay for text readability */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Expand Button - Only visible on the back when revealed */}
            <button 
              onClick={handleExpand}
              className="absolute top-3 right-3 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg text-white border border-white/20 transition-all opacity-0 group-hover/card:opacity-100 transform translate-y-2 group-hover/card:translate-y-0"
              title="Expand Image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
              <h3 className="text-2xl font-bold mb-2 leading-tight drop-shadow-sm">
                {card.title}
              </h3>
              <p className="text-sm text-gray-200 line-clamp-4 leading-relaxed opacity-90">
                {card.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setIsExpanded(false)}
          >
            {/* Close Button - Top Level */}
            <button 
              onClick={() => setIsExpanded(false)}
              className="fixed top-6 right-6 z-[210] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-[98vw] h-[96vh] flex flex-col md:flex-row overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container - Grows to fill available space */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl m-2 sm:m-4">
                <img 
                  src={card.imageSrc} 
                  alt={card.title} 
                  className="w-full h-full object-contain pointer-events-none"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />

                {/* Mobile Toggle Button (Floating) */}
                <button 
                  onClick={toggleInfo}
                  className="md:hidden absolute bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg z-30"
                >
                  <Info className="w-6 h-6" />
                </button>
              </div>

              {/* Info Panel - Sliding Sidebar/Overlay */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={cn(
                      "fixed md:relative inset-y-0 right-0 w-full md:w-[400px] z-[205]",
                      "bg-zinc-900/90 md:bg-zinc-900/40 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col"
                    )}
                  >
                    {/* Panel Header */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                       <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                         Card #{card.displayNumber}
                       </div>
                       <button 
                         onClick={toggleInfo}
                         className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                         title="Hide Sidebar"
                       >
                         <ChevronRight className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                          {card.title}
                        </h2>
                        <div className="h-1.5 w-16 bg-indigo-500 rounded-full" />
                      </div>
                      
                      <div className="text-zinc-300 leading-relaxed text-xl font-light whitespace-pre-wrap">
                        {card.description}
                      </div>
                    </div>

                    <div className="p-8 border-t border-white/10">
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="w-full py-4 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-200 transition-colors active:scale-[0.98] shadow-xl"
                      >
                        Back to Deck
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Re-open Info Sidebar Button (if hidden) */}
              {!showInfo && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={toggleInfo}
                  className="fixed right-6 top-1/2 -translate-y-1/2 z-[205] p-3 bg-white/10 hover:bg-indigo-600 text-white rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg"
                  title="Show Info"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};