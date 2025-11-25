import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FlipCard } from './components/FlipCard';
import { CardData, GameSession } from './types';
import { shuffleArray, cn } from './utils';
import { LayoutGrid, RefreshCw, Plus, Download, X, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  // activeSessionId is null when showing the "New Game" (Upload) screen
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const processCards = (rawCards: CardData[]): CardData[] => {
    const shuffled = shuffleArray([...rawCards]);
    return shuffled.map((card, index) => ({
      ...card,
      displayNumber: index + 1,
    }));
  };

  const handleDataLoaded = (loadedCards: CardData[], filename: string) => {
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      name: filename.replace('.csv', '').substring(0, 20) || `Game ${sessions.length + 1}`,
      cards: processCards(loadedCards),
      version: 0
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleReshuffle = () => {
    if (!activeSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        return {
          ...session,
          cards: processCards(session.cards),
          version: session.version + 1
        };
      }
      return session;
    }));
  };

  const closeSession = (e: React.MouseEvent, idToClose: string) => {
    e.stopPropagation();
    
    // Determine next active session
    let nextActiveId = activeSessionId;
    if (activeSessionId === idToClose) {
      const index = sessions.findIndex(s => s.id === idToClose);
      // Try to go to previous, or next, or null (new game)
      if (sessions.length > 1) {
        if (index > 0) nextActiveId = sessions[index - 1].id;
        else nextActiveId = sessions[index + 1].id;
      } else {
        nextActiveId = null;
      }
    }

    setSessions(prev => prev.filter(s => s.id !== idToClose));
    setActiveSessionId(nextActiveId);
  };

  const downloadExampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "title,description,image_url\n"
      + "Mountain Sunset,A beautiful sunset over the rocky mountains.,https://picsum.photos/id/10/800/800\n"
      + "Ocean Breeze,Calm waves hitting the sandy shore.,https://picsum.photos/id/11/800/800\n"
      + "Urban City,A busy city street at night with neon lights.,https://picsum.photos/id/12/800/800\n"
      + "Forest Path,A quiet path through a dense green forest.,https://picsum.photos/id/13/800/800";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "example_cards.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden md:block">
              Memory Flip Grid
            </h1>
          </div>
          
          <div className="flex-1 px-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-2">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                    activeSessionId === session.id
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <Gamepad2 className="w-3.5 h-3.5 opacity-70" />
                  <span className="max-w-[100px] truncate">{session.name}</span>
                  <div 
                    onClick={(e) => closeSession(e, session.id)}
                    className={cn(
                      "p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100",
                      activeSessionId === session.id ? "opacity-100" : ""
                    )}
                  >
                    <X className="w-3 h-3" />
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => setActiveSessionId(null)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent",
                  activeSessionId === null 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
                title="New Game"
              >
                <Plus className="w-4 h-4" />
                <span className={sessions.length === 0 ? "inline" : "hidden sm:inline"}>New Game</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             {activeSession && (
               <button 
                 onClick={handleReshuffle}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95"
               >
                 <RefreshCw className="w-4 h-4" />
                 <span className="hidden sm:inline">Reshuffle</span>
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
        <AnimatePresence mode="wait">
          
          {/* Upload State (New Game) */}
          {!activeSession && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  {sessions.length > 0 ? "Add Another Game" : "Transform Data into Flashcards"}
                </h2>
                <p className="text-lg text-gray-600">
                  Upload a CSV file containing titles, descriptions, and images to generate a new card grid.
                </p>
                
                <button 
                  onClick={downloadExampleCSV}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download example CSV
                </button>
              </div>

              <FileUpload onDataLoaded={handleDataLoaded} />
            </motion.div>
          )}

          {/* Grid State */}
          {activeSession && (
            <motion.div
              key={activeSession.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
               {/* Grid key combines session ID and version to trigger re-renders on reshuffle */}
               <div key={`${activeSession.id}-${activeSession.version}`} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                 {activeSession.cards.map((card, index) => (
                   <motion.div
                     key={`${card.id}`}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                   >
                     <FlipCard card={card} />
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          Memory Flip Grid &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}