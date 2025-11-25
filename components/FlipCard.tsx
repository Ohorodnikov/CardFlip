import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardData } from '../types';
import { cn } from '../utils';

interface FlipCardProps {
  card: CardData;
}

export const FlipCard: React.FC<FlipCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="relative h-80 w-full cursor-pointer perspective-1000 group"
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
             />
             {/* Overlay for text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 flex flex-col justify-end h-full">
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
  );
};