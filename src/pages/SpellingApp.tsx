import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../store';

const wordList = [
  // Easy
  { word: 'CAT', level: 1 }, { word: 'DOG', level: 1 }, { word: 'SUN', level: 1 }, { word: 'HAT', level: 1 },
  { word: 'TREE', level: 2 }, { word: 'BIRD', level: 2 }, { word: 'FISH', level: 2 }, { word: 'STAR', level: 2 },
  // Medium
  { word: 'APPLE', level: 3 }, { word: 'HOUSE', level: 3 }, { word: 'WATER', level: 3 }, { word: 'CHAIR', level: 3 },
  { word: 'SCHOOL', level: 4 }, { word: 'FRIEND', level: 4 }, { word: 'MOTHER', level: 4 }, { word: 'FATHER', level: 4 },
  // Harder
  { word: 'BEAUTIFUL', level: 5 }, { word: 'UMBRELLA', level: 5 }, { word: 'TOMORROW', level: 5 }, { word: 'YESTERDAY', level: 5 },
  { word: 'ELEPHANT', level: 6 }, { word: 'DIFFERENT', level: 6 }, { word: 'KNOWLEDGE', level: 6 }, { word: 'FAVORITE', level: 6 }
];

const getWordForLevel = (level: number) => {
  // Try to find words matching the level, if not default to highest available
  const maxLevelWords = wordList.filter(w => w.level >= 5);
  let availableWords = wordList.filter(w => w.level === level || w.level === level - 1);
  if (availableWords.length === 0) availableWords = maxLevelWords;
  
  return availableWords[Math.floor(Math.random() * availableWords.length)].word;
};

const getMaskedWord = (word: string, level: number) => {
  if (level >= 6) {
    // All letters hidden
    return Array(word.length).fill('_');
  }
  
  const chars = word.split('');
  // Number of letters to hide
  // Level 1: 1
  // Level 2: 2
  // Level 3: 50%
  // Level 4: 75%
  let hiddenCount = 1;
  if (level === 2) hiddenCount = Math.min(2, word.length - 1);
  if (level === 3) hiddenCount = Math.floor(word.length / 2);
  if (level === 4) hiddenCount = Math.floor(word.length * 0.75);
  if (level === 5) hiddenCount = word.length - 1; // Only 1 letter shown
  
  const indicesToHide: number[] = [];
  while (indicesToHide.length < hiddenCount && indicesToHide.length < word.length) {
    const idx = Math.floor(Math.random() * word.length);
    if (!indicesToHide.includes(idx)) {
      indicesToHide.push(idx);
    }
  }
  
  return chars.map((char, i) => indicesToHide.includes(i) ? '_' : char);
};

export default function SpellingApp() {
  const navigate = useNavigate();
  const { currentUser, updateLevel } = useAppContext();
  
  const [sessionLevel, setSessionLevel] = useState(currentUser?.spellingLevel || 1);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [maskedWord, setMaskedWord] = useState<string[]>([]);
  const [phase, setPhase] = useState<'start' | 'memorize' | 'spell'>('start');
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const startGame = () => {
    nextWord(sessionLevel);
  };

  const nextWord = (level: number) => {
    const w = getWordForLevel(level);
    setCurrentWord(w);
    setMaskedWord(getMaskedWord(w, level));
    setPhase('memorize');
    setInputText('');
    setFeedback(null);
  };

  const handleLevelChange = (delta: number) => {
    const nextLevel = Math.max(1, sessionLevel + delta);
    setSessionLevel(nextLevel);
    if (nextLevel > (currentUser?.spellingLevel || 1)) {
        updateLevel('spelling', 1);
    }
  };

  const checkSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.toUpperCase() === currentWord) {
      setFeedback('correct');
      handleLevelChange(1);
      setTimeout(() => nextWord(sessionLevel + 1), 1500);
    } else {
      setFeedback('incorrect');
      handleLevelChange(-1);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <button className="glass-panel" onClick={() => navigate('/')} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="title-font gradient-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Spelling Challenge</h1>
        <div className="card" style={{ padding: '4rem 2rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            We'll show you a word. Memorize it, then click "I'm Ready!" 
            We'll hide some letters and you have to type the whole word.
          </p>
          <button className="btn-primary" style={{ fontSize: '2rem' }} onClick={startGame}>
            Let's Go!
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="glass-panel" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
          Spelling Level <strong style={{ color: 'var(--purple)' }}>{sessionLevel}</strong>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <AnimatePresence mode="wait">
          {phase === 'memorize' && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="title-font" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--warning)' }}>Read the word:</h2>
              <div style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '0.3rem', marginBottom: '3rem', fontFamily: "'Fredoka One', cursive", color: 'var(--text-primary)' }}>
                {currentWord}
              </div>
              <button 
                className="btn-primary" 
                style={{ fontSize: '1.5rem', padding: '1rem 3rem', backgroundColor: 'var(--success)' }}
                onClick={() => setPhase('spell')}
              >
                I'm Ready!
              </button>
            </motion.div>
          )}

          {phase === 'spell' && (
            <motion.div
              key="spell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Type the missing word:</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                {maskedWord.map((char, i) => (
                  <div key={i} style={{ 
                    width: '3rem', height: '4rem', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 800,
                    borderBottom: char === '_' ? '4px solid var(--primary)' : 'none',
                    color: char === '_' ? 'transparent' : 'var(--text-primary)'
                  }}>
                    {char}
                  </div>
                ))}
              </div>
              
              <form onSubmit={checkSpelling} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.toUpperCase())}
                  disabled={feedback === 'correct'}
                  autoFocus
                  style={{ maxWidth: '300px', fontSize: '2rem', textTransform: 'uppercase' }}
                  placeholder="Type here..."
                />
                <button type="submit" disabled={!inputText || feedback === 'correct'} className="btn-primary" style={{ fontSize: '1.5rem', padding: '0.5rem 3rem' }}>
                  Check
                </button>
              </form>

              {feedback && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} 
                  style={{ marginTop: '2rem', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: feedback === 'correct' ? 'var(--success)' : 'var(--danger)' }}
                >
                  {feedback === 'correct' ? (
                    <><CheckCircle size={32} /> Fantastic!</>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '0.5rem' }}><XCircle size={32} /> Not quite right.</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '1rem' }}>
                        The word was <strong>{currentWord}</strong>.
                      </div>
                      <button className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 2rem' }} onClick={() => nextWord(sessionLevel)}>Try Another</button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
