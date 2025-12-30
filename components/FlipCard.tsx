import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { CardData } from '../types';
import { cn } from '../utils';

interface FlipCardProps {
  card: CardData;
}

export const FlipCard: React.FC<FlipCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
                <img 
                  src={card.imageSrc} 
                  alt={card.title} 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Info Sidebar */}
              <div className="w-full md:w-80 lg:w-96 p-8 flex flex-col border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto bg-zinc-900/50 backdrop-blur-xl">
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                     Card #{card.displayNumber}
                   </div>
                   <button 
                     onClick={() => setIsExpanded(false)}
                     className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {card.title}
                </h2>
                
                <div className="h-px w-12 bg-indigo-500 mb-6" />
                
                <p className="text-zinc-400 leading-relaxed text-lg whitespace-pre-wrap">
                  {card.description}
                </p>

                <div className="mt-auto pt-8">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full py-4 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-200 transition-colors active:scale-[0.98]"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};