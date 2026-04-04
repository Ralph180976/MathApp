import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Flame, Zap, BookOpen } from 'lucide-react';
import { useAppContext, calculateSpellingScore, BADGE_DEFS } from '../store';
import { getWordForLevel, getSpellingLevelDescription } from '../data/wordBank';
import type { WordEntry } from '../data/wordBank';

export default function SpellingApp() {
  const navigate = useNavigate();
  const { currentUser, updateLevel, recordSpellingAnswer } = useAppContext();
  
  const [sessionLevel, setSessionLevel] = useState(currentUser?.spellingLevel || 1);
  const [currentEntry, setCurrentEntry] = useState<WordEntry | null>(null);
  const [phase, setPhase] = useState<'start' | 'memorize' | 'spell'>('start');
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime, setStartTime] = useState(0);

  // Scoring & streak state
  const [streak, setStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<{ total: number; speedBonus: number; lengthBonus: number; streakMultiplier: number } | null>(null);
  const [newBadgePopup, setNewBadgePopup] = useState<string | null>(null);
  const [, setCorrectCount] = useState(0);

  const startGame = () => {
    nextWord(sessionLevel);
  };

  const nextWord = (level: number) => {
    const entry = getWordForLevel(level);
    setCurrentEntry(entry);
    setPhase('memorize');
    setInputText('');
    setFeedback(null);
    setLastPoints(null);
  };

  const handleReady = () => {
    setPhase('spell');
    setStartTime(Date.now());
  };

  const handleLevelChange = (delta: number) => {
    const nextLevel = Math.max(1, Math.min(20, sessionLevel + delta));
    setSessionLevel(nextLevel);
    if (nextLevel > (currentUser?.spellingLevel || 1)) {
      updateLevel('spelling', 1);
    }
  };

  const checkSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry) return;
    
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = inputText.toUpperCase() === currentEntry.word;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(prev => prev + 1);
      
      const scoreInfo = calculateSpellingScore(timeTaken, newStreak, currentEntry.word.length);
      setSessionScore(prev => prev + scoreInfo.total);
      setLastPoints({ total: scoreInfo.total, speedBonus: scoreInfo.speedBonus, lengthBonus: scoreInfo.lengthBonus, streakMultiplier: scoreInfo.streakMultiplier });
      
      const { newBadges } = recordSpellingAnswer(true, timeTaken, newStreak, currentEntry.word.length);
      
      if (newBadges.length > 0) {
        setNewBadgePopup(newBadges[0]);
        setTimeout(() => setNewBadgePopup(null), 3000);
      }
      
      setFeedback('correct');
      
      // Level up every 5 correct in a row, or fast answers
      if (newStreak % 5 === 0 || (timeTaken < 8 && newStreak >= 3)) {
        handleLevelChange(1);
      }
      
      setTimeout(() => nextWord(sessionLevel), 2000);
    } else {
      setFeedback('incorrect');
      setStreak(0);
      recordSpellingAnswer(false, 0, 0, currentEntry.word.length);
      if (streak === 0) handleLevelChange(-1);
    }
  };

  const levelDesc = getSpellingLevelDescription(sessionLevel);
  const spellingScore = currentUser?.stats?.spellingScore || 0;
  const badgeCount = currentUser?.stats?.badges?.length || 0;

  // ─── Start screen ───
  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <button className="glass-panel" onClick={() => navigate('/')} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        
        {/* Stats bar */}
        {spellingScore > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)' }}>
              <Zap size={16} /> <span className="title-font" style={{ fontSize: '1rem' }}>{spellingScore} pts</span>
            </div>
            {badgeCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--purple)' }}>
                <span style={{ fontSize: '1.1rem' }}>🏅</span>
                <span className="title-font" style={{ fontSize: '1rem' }}>{badgeCount} badge{badgeCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        <h1 className="title-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--purple)' }}>
          📝 Spelling Challenge
        </h1>
        
        {/* Level info */}
        <div className="glass-panel" style={{ padding: '0.8rem 1.2rem', marginBottom: '1.5rem', display: 'inline-block', borderRadius: '2rem' }}>
          Level <strong style={{ color: 'var(--purple)' }}>{sessionLevel}</strong>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>· {levelDesc}</span>
        </div>

        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We'll show you a word. <br/>
            Read it carefully, then type it from memory!
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
            Score points for speed and streaks 🔥
          </p>
          <button className="btn-primary" style={{ fontSize: '1.8rem', padding: '0.8rem 3rem', borderRadius: '2rem' }} onClick={startGame}>
            Let's Go!
          </button>
        </div>

        {/* Spelling badges */}
        {currentUser?.stats?.badges && currentUser.stats.badges.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
            <h3 className="title-font" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              🏅 Your Badges
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {currentUser.stats.badges.map(badgeId => {
                const badge = BADGE_DEFS.find(b => b.id === badgeId);
                if (!badge) return null;
                return (
                  <div key={badgeId} title={badge.description} style={{
                    padding: '0.4rem 0.7rem',
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '2rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: 'var(--purple)',
                  }}>
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ─── Game screen ───
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
        <button className="glass-panel" onClick={() => { setPhase('start'); setStreak(0); setSessionScore(0); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        
        {/* Score + streak display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {streak >= 3 && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: streak >= 10 ? 'var(--danger)' : 'var(--warning)', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <Flame size={14} /> {streak}
            </motion.div>
          )}
          {sessionScore > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 700 }}>
              <Zap size={14} /> {sessionScore}
            </div>
          )}
        </div>
        
        <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.85rem', textAlign: 'center', flexShrink: 0 }}>
          <div>Lvl <strong style={{ color: 'var(--purple)' }}>{sessionLevel}</strong></div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{levelDesc}</div>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Points popup */}
        {lastPoints && feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute', top: '0.5rem', right: '0.8rem',
              fontSize: '1rem', fontWeight: 800, color: 'var(--warning)',
              zIndex: 20, fontFamily: "'Fredoka One', cursive",
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            }}
          >
            <span>+{lastPoints.total}</span>
            {lastPoints.speedBonus > 0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>⚡ speed +{lastPoints.speedBonus}</span>
            )}
            {lastPoints.lengthBonus > 0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--purple)' }}>📏 length +{lastPoints.lengthBonus}</span>
            )}
            {lastPoints.streakMultiplier > 1 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--danger)' }}>🔥 ×{lastPoints.streakMultiplier}</span>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'memorize' && currentEntry && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '0.8rem', color: 'var(--warning)' }}>
                Read the word carefully:
              </h2>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                style={{ 
                  fontSize: `clamp(2rem, ${Math.max(1, 6 - currentEntry.word.length * 0.15)}vw, 4rem)`,
                  fontWeight: 800, 
                  letterSpacing: '0.15em', 
                  marginBottom: '1rem', 
                  fontFamily: "'Fredoka One', cursive", 
                  color: 'var(--text-primary)',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                }}
              >
                {currentEntry.word}
              </motion.div>
              
              {/* Letter count hint */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {currentEntry.word.length} letters
              </div>

              <button 
                className="btn-primary" 
                style={{ fontSize: '1.3rem', padding: '0.8rem 2.5rem', backgroundColor: 'var(--success)', borderRadius: '2rem' }}
                onClick={handleReady}
              >
                I'm Ready! ✋
              </button>
            </motion.div>
          )}

          {phase === 'spell' && currentEntry && (
            <motion.div
              key="spell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="title-font" style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                Now spell it!
              </h2>
              
              {/* Letter boxes showing how many letters */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {currentEntry.word.split('').map((_, i) => {
                  const typedChar = inputText.toUpperCase()[i] || '';
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ 
                        width: `clamp(1.8rem, ${Math.max(2, 4 - currentEntry.word.length * 0.1)}vw, 3rem)`, 
                        height: `clamp(2.2rem, ${Math.max(2.5, 5 - currentEntry.word.length * 0.1)}vw, 3.8rem)`, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: `clamp(1rem, ${Math.max(1, 2.5 - currentEntry.word.length * 0.07)}vw, 2rem)`,
                        fontWeight: 800,
                        fontFamily: "'Fredoka One', cursive",
                        borderRadius: '0.4rem',
                        background: typedChar 
                          ? (feedback === 'correct' ? 'rgba(34, 197, 94, 0.2)' : feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                          : 'rgba(255,255,255,0.05)',
                        border: typedChar
                          ? (feedback === 'correct' ? '2px solid var(--success)' : feedback === 'incorrect' ? '2px solid var(--danger)' : '2px solid var(--primary)')
                          : (i === inputText.length ? '2px solid var(--warning)' : '2px solid rgba(255,255,255,0.1)'),
                        color: feedback === 'correct' ? 'var(--success)' : feedback === 'incorrect' ? 'var(--danger)' : 'var(--text-primary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {typedChar || ''}
                    </motion.div>
                  );
                })}
              </div>
              
              <form onSubmit={checkSpelling} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.toUpperCase())}
                  disabled={feedback === 'correct'}
                  autoFocus
                  maxLength={currentEntry.word.length + 2}
                  style={{ 
                    maxWidth: '320px', 
                    fontSize: '1.5rem', 
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    padding: '0.6rem 1rem',
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  placeholder="Type the word..."
                />
                <button 
                  type="submit" 
                  disabled={!inputText || feedback === 'correct'} 
                  className="btn-primary" 
                  style={{ fontSize: '1.2rem', padding: '0.5rem 2.5rem', borderRadius: '2rem' }}
                >
                  Check ✓
                </button>
              </form>

              {/* Feedback */}
              {feedback && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ 
                    marginTop: '1.2rem', 
                    fontSize: '1.2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                  }}
                >
                  {feedback === 'correct' ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                        <CheckCircle size={28} /> 
                        <span className="title-font" style={{ fontSize: '1.4rem' }}>Brilliant!</span>
                      </div>
                      {/* Show definition if available */}
                      {currentEntry.definition && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          style={{ 
                            marginTop: '0.5rem',
                            padding: '0.8rem 1.2rem', 
                            background: 'rgba(139, 92, 246, 0.1)', 
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            borderRadius: '1rem',
                            maxWidth: '350px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--purple)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                            <BookOpen size={14} />
                            <span className="title-font">What does it mean?</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{currentEntry.word}</strong> — {currentEntry.definition}
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                        <XCircle size={28} />
                        <span className="title-font" style={{ fontSize: '1.2rem' }}>Not quite!</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
                        The word was <strong style={{ color: 'var(--primary)', letterSpacing: '0.1em' }}>{currentEntry.word}</strong>
                      </div>
                      {/* Show definition for incorrect answers too */}
                      {currentEntry.definition && (
                        <div style={{ 
                          marginTop: '0.4rem',
                          padding: '0.6rem 1rem', 
                          background: 'rgba(139, 92, 246, 0.08)', 
                          borderRadius: '0.8rem',
                          maxWidth: '350px',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}>
                          <BookOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                          {currentEntry.definition}
                        </div>
                      )}
                      <button 
                        className="btn-primary" 
                        style={{ marginTop: '0.8rem', padding: '0.5rem 2rem', borderRadius: '2rem' }} 
                        onClick={() => nextWord(sessionLevel)}
                      >
                        Try Another →
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge popup */}
      <AnimatePresence>
        {newBadgePopup && (() => {
          const badge = BADGE_DEFS.find(b => b.id === newBadgePopup);
          if (!badge) return null;
          return (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95))',
                padding: '1.5rem 2rem',
                borderRadius: '1.5rem',
                zIndex: 1000,
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
              <div className="title-font" style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>New Badge!</div>
              <div className="title-font" style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>{badge.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.3rem' }}>{badge.description}</div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}
