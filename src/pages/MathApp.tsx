import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, ChevronRight, ChevronLeft, Flame, Zap, Trophy } from 'lucide-react';
import { useAppContext, calculateScore, getLevelDescription, BADGE_DEFS } from '../store';
import type { MathOperation } from '../store';
import { MathKeypad } from '../components/MathKeypad';
import { MultiplicationHelp } from '../components/MultiplicationHelp';
import { BusStopDivision } from '../components/BusStopDivision';


type Operation = '+' | '-' | '*' | '/' | 'Random';

interface Question {
  num1: number;
  num2: number;
  op: '+' | '-' | '*' | '/';
  answer: number;
}

// ─── Structured question generation ───

function generateMultiplication(level: number): { num1: number; num2: number } {
  if (level >= 1 && level <= 8) {
    // Level 1=×2, Level 2=×3, ... Level 8=×9
    const table = level + 1;
    const other = Math.floor(Math.random() * 10) + 1; // 1-10
    // Randomly swap order so it's not always "table × other"
    return Math.random() < 0.5 ? { num1: other, num2: table } : { num1: table, num2: other };
  }
  if (level === 9) {
    // Mixed: all tables 2-10
    const table = Math.floor(Math.random() * 9) + 2; // 2-10
    const other = Math.floor(Math.random() * 10) + 1; // 1-10
    return Math.random() < 0.5 ? { num1: other, num2: table } : { num1: table, num2: other };
  }
  if (level >= 10 && level <= 15) {
    // Level 10=×11, Level 11=×12, ... Level 15=×16
    const table = level + 1;
    const other = Math.floor(Math.random() * 12) + 1; // 1-12
    return Math.random() < 0.5 ? { num1: other, num2: table } : { num1: table, num2: other };
  }
  // Level 16+: 2-digit × 2-digit
  const maxRange = Math.min(11 + (level - 16) * 3, 50);
  const num1 = Math.floor(Math.random() * (maxRange - 11 + 1)) + 11;
  const num2 = Math.floor(Math.random() * (maxRange - 11 + 1)) + 11;
  return { num1, num2 };
}

function generateDivision(level: number): { num1: number; num2: number } {
  // Mirror multiplication: divide by the times table number
  if (level >= 1 && level <= 8) {
    const divisor = level + 1; // Level 1=÷2, Level 2=÷3, ... Level 8=÷9
    const quotient = Math.floor(Math.random() * 10) + 1; // 1-10
    const remainder = Math.floor(Math.random() * divisor); // 0 to divisor-1
    const dividend = divisor * quotient + remainder;
    return { num1: dividend, num2: divisor };
  }
  if (level === 9) {
    // Mixed ÷2 through ÷10
    const divisor = Math.floor(Math.random() * 9) + 2; // 2-10
    const quotient = Math.floor(Math.random() * 10) + 1;
    const remainder = Math.floor(Math.random() * divisor);
    const dividend = divisor * quotient + remainder;
    return { num1: dividend, num2: divisor };
  }
  if (level >= 10 && level <= 15) {
    const divisor = level + 1; // Level 10=÷11, ... Level 15=÷16
    const quotient = Math.floor(Math.random() * 12) + 1;
    const remainder = Math.floor(Math.random() * divisor);
    const dividend = divisor * quotient + remainder;
    return { num1: dividend, num2: divisor };
  }
  // Level 16+: larger divisions
  const maxDivisor = Math.min(10 + (level - 16) * 2, 30);
  const divisor = Math.floor(Math.random() * (maxDivisor - 11 + 1)) + 11;
  const quotient = Math.floor(Math.random() * 20) + 5;
  const remainder = Math.floor(Math.random() * divisor);
  return { num1: divisor * quotient + remainder, num2: divisor };
}

function generateAddition(level: number): { num1: number; num2: number } {
  if (level <= 2) {
    // Single digits: 1-9 + 1-9
    return { num1: Math.floor(Math.random() * 9) + 1, num2: Math.floor(Math.random() * 9) + 1 };
  }
  if (level <= 4) {
    // Double digits
    const max = 10 + (level - 2) * 15; // level 3: up to 25, level 4: up to 40
    return {
      num1: Math.floor(Math.random() * max) + 10,
      num2: Math.floor(Math.random() * max) + 5,
    };
  }
  if (level <= 6) {
    // Larger doubles
    const max = 40 + (level - 4) * 30;
    return {
      num1: Math.floor(Math.random() * max) + 20,
      num2: Math.floor(Math.random() * max) + 10,
    };
  }
  if (level <= 8) {
    // Triple digits
    return {
      num1: Math.floor(Math.random() * 400) + 100,
      num2: Math.floor(Math.random() * 200) + 50,
    };
  }
  // Level 9+: increasingly large
  const scale = Math.min(level - 8, 5);
  return {
    num1: Math.floor(Math.random() * (500 * scale)) + 100,
    num2: Math.floor(Math.random() * (300 * scale)) + 50,
  };
}

function generateSubtraction(level: number): { num1: number; num2: number } {
  const { num1: a, num2: b } = generateAddition(level);
  // Ensure positive result
  const num1 = Math.max(a, b);
  const num2 = Math.min(a, b);
  // Avoid zero results at low levels
  if (num1 === num2) return { num1: num1 + Math.floor(Math.random() * 5) + 1, num2 };
  return { num1, num2 };
}

const generateQuestion = (level: number, selectedOp: Operation): Question => {
  let op = selectedOp;
  if (selectedOp === 'Random') {
    const ops: ('+' | '-' | '*' | '/')[] = ['+', '-', '*', '/'];
    op = ops[Math.floor(Math.random() * ops.length)];
  }

  let num1 = 0, num2 = 0;
  switch (op) {
    case '*': ({ num1, num2 } = generateMultiplication(level)); break;
    case '/': ({ num1, num2 } = generateDivision(level)); break;
    case '+': ({ num1, num2 } = generateAddition(level)); break;
    case '-': ({ num1, num2 } = generateSubtraction(level)); break;
  }

  let answer = 0;
  switch (op) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '*': answer = num1 * num2; break;
    case '/': answer = Math.floor(num1 / num2); break;
  }

  return { num1, num2, op: op as '+' | '-' | '*' | '/', answer };
};

type DivisionMode = 'interactive' | 'help' | null;

export default function MathApp() {
  const navigate = useNavigate();
  const { currentUser, updateLevel, recordAnswer } = useAppContext();
  
  const [operation, setOperation] = useState<Operation | null>(null);
  const [sessionLevel, setSessionLevel] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [busStopInputHandler, setBusStopInputHandler] = useState<((val: string) => void) | null>(null);
  const [stepInInputHandler, setStepInInputHandler] = useState<((val: string) => void) | null>(null);
  const [isHelping, setIsHelping] = useState(false);
  const [isSteppingIn, setIsSteppingIn] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [divisionMode, setDivisionMode] = useState<DivisionMode>(null);

  // ─── Scoring & streak state ───
  const [streak, setStreak] = useState(0);
  const [fastStreak, setFastStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<{ total: number; speedBonus: number; streakMultiplier: number } | null>(null);
  const [newBadgePopup, setNewBadgePopup] = useState<string | null>(null);
  const [, setCorrectCount] = useState(0);
  const [, setIncorrectCount] = useState(0);

  const resetHelp = () => {
    setIsHelping(false);
    setIsSteppingIn(false);
    setHelpStep(0);
    setDivisionMode(null);
  };

  // Help solver derived values (units → tens → hundreds, right-to-left)
  const helpDigits1 = question ? question.num1.toString().split('') : [];
  const helpDigits2 = question ? question.num2.toString().split('') : [];
  const helpMaxLen = Math.max(helpDigits1.length, helpDigits2.length);
  const helpPad1 = question ? question.num1.toString().padStart(helpMaxLen, '0').split('') : [];
  const helpPad2 = question ? question.num2.toString().padStart(helpMaxLen, '0').split('') : [];
  const helpTotalSteps = helpMaxLen + 1;
  const helpColumnNames = ['Units', 'Tens', 'Hundreds', 'Thousands'];


  // Compute column results with carries/borrows
  const helpColumns: { d1: number; d2: number; borrow: number; displayD1: number; result: number; answerDigit: number; carryOut: number; borrowed: boolean }[] = [];
  {
    let borrow = 0;
    for (let col = 1; col <= helpMaxLen; col++) {
      const idx = helpMaxLen - col;
      const d1 = parseInt(helpPad1[idx]) || 0;
      const d2 = parseInt(helpPad2[idx]) || 0;
      if (question?.op === '+') {
        const sum = d1 + d2 + borrow;
        helpColumns.push({ d1, d2, borrow, displayD1: d1, result: sum, answerDigit: sum % 10, carryOut: Math.floor(sum / 10), borrowed: false });
        borrow = Math.floor(sum / 10);
      } else {
        const top = d1 - borrow;
        const needsBorrow = top < d2;
        const displayD1 = needsBorrow ? top + 10 : top;
        const result = displayD1 - d2;
        helpColumns.push({ d1, d2, borrow, displayD1, result, answerDigit: result, carryOut: needsBorrow ? 1 : 0, borrowed: needsBorrow });
        borrow = needsBorrow ? 1 : 0;
      }
    }
  }
  const helpColResult = helpStep >= 1 && helpStep <= helpMaxLen ? helpColumns[helpStep - 1] : null;

  // Exchange annotations
  const helpExchangeAnnotations: (number | null)[] = helpPad1.map((_, i) => {
    const colFromRight = helpMaxLen - i;
    const colIdx = colFromRight - 1;
    if (colIdx < 0 || colIdx >= helpColumns.length) return null;
    const col = helpColumns[colIdx];
    if (col.displayD1 !== col.d1) return col.displayD1;
    return null;
  });

  const startGame = (op: Operation) => {
    setOperation(op);
    let levelToUse = 1;
    if (currentUser?.mathLevels) {
      if (op === 'Random') {
        levelToUse = Math.max(...Object.values(currentUser.mathLevels));
      } else {
        levelToUse = currentUser.mathLevels[op as '+' | '-' | '*' | '/'] || 1;
      }
    }
    setSessionLevel(levelToUse);
    setStreak(0);
    setFastStreak(0);
    setSessionScore(0);
    setLastPoints(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    resetHelp();
    nextQuestion(op, levelToUse);
  };

  const nextQuestion = (op: Operation, level: number) => {
    setFeedback(null);
    setAnswerInput('');
    setQuestion(generateQuestion(level, op));
    setStartTime(Date.now());
    setLastPoints(null);
    resetHelp();
  };

  // ─── Correct answer handler (shared between normal + bus stop + step-in) ───
  const handleCorrectAnswer = (op: MathOperation) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const newStreak = streak + 1;
    const newFastStreak = timeTaken < 3 ? fastStreak + 1 : 0;
    
    setStreak(newStreak);
    setFastStreak(newFastStreak);
    setCorrectCount(prev => prev + 1);
    
    const scoreInfo = calculateScore(timeTaken, newStreak);
    setSessionScore(prev => prev + scoreInfo.total);
    setLastPoints({ total: scoreInfo.total, speedBonus: scoreInfo.speedBonus, streakMultiplier: scoreInfo.streakMultiplier });
    
    // Record in store (persists to localStorage)
    const { newBadges } = recordAnswer(op, true, timeTaken, newStreak, newFastStreak);
    
    // Show badge popup if earned
    if (newBadges.length > 0) {
      setNewBadgePopup(newBadges[0]);
      setTimeout(() => setNewBadgePopup(null), 3000);
    }
    
    setFeedback('correct');
    
    // Level up every 5 correct in a row, or if fast enough
    if (newStreak % 5 === 0 || (timeTaken < 4 && newStreak >= 3)) {
      handleLevelChange(1);
    }
    
    setTimeout(() => nextQuestion(operation!, sessionLevel), 1500);
  };

  const handleLevelChange = (delta: number) => {
    const nextLevel = Math.max(1, sessionLevel + delta);
    setSessionLevel(nextLevel);
    
    if (operation && operation !== 'Random' && currentUser?.mathLevels) {
      if (nextLevel > currentUser.mathLevels[operation as '+' | '-' | '*' | '/']) {
        updateLevel(operation as '+' | '-' | '*' | '/', 1);
      }
    }
  };

  const handleSubmit = () => {
    if (!question) return;

    const isCorrect = parseFloat(answerInput) === question.answer;

    if (isCorrect) {
      handleCorrectAnswer(question.op);
    } else {
      setFeedback('incorrect');
      setAnswerInput('');
      setStreak(0);
      setFastStreak(0);
      setIncorrectCount(prev => prev + 1);
      recordAnswer(question.op, false, 0, 0, 0);
      if (streak === 0) handleLevelChange(-1);
    }
  };

  const handleBusStopComplete = () => {
    if (!question) return;
    handleCorrectAnswer(question.op);
  };

  // ─── Subject selection screen ───
  if (!operation) {
    const totalScore = currentUser?.stats ? Object.values(currentUser.stats.scores).reduce((a, b) => a + b, 0) : 0;
    const badgeCount = currentUser?.stats?.badges?.length || 0;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button className="glass-panel" onClick={() => navigate('/')} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        
        {/* Stats bar */}
        {totalScore > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)' }}>
              <Trophy size={16} /> <span className="title-font" style={{ fontSize: '1rem' }}>{totalScore} pts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--purple)' }}>
              <span style={{ fontSize: '1.1rem' }}>🏅</span> <span className="title-font" style={{ fontSize: '1rem' }}>{badgeCount} badge{badgeCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        <h1 className="title-font gradient-text" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Select Subject</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
          {(['+', '-', '*', '/', 'Random'] as Operation[]).map((op) => {
            const level = op !== 'Random' && currentUser?.mathLevels ? currentUser.mathLevels[op as MathOperation] : null;
            const desc = level ? getLevelDescription(level, op as MathOperation) : '';
            const opScore = op !== 'Random' && currentUser?.stats ? currentUser.stats.scores[op as MathOperation] : null;
            
            return (
              <button key={op} className="card" onClick={() => startGame(op)} style={{ fontSize: '1.2rem', padding: '1.5rem 1rem', background: 'var(--surface-hover)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', gridColumn: op === 'Random' ? 'span 2' : 'auto' }}>
                <span style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>{op === '+' ? '➕' : op === '-' ? '➖' : op === '*' ? '✖️' : op === '/' ? '➗' : '🎲'}</span>
                <span className="title-font">{op === 'Random' ? 'Random Match' : op === '+' ? 'Addition' : op === '-' ? 'Subtraction' : op === '*' ? 'Multiplication' : 'Division'}</span>
                {level && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    Lvl {level} · {desc}
                  </span>
                )}
                {opScore !== null && opScore > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--warning)', marginTop: '0.1rem' }}>
                    ⭐ {opScore} pts
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Badges section */}
        {badgeCount > 0 && currentUser?.stats?.badges && (
          <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
            <h3 className="title-font" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textAlign: 'center' }}>
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

  // ─── Active game screen ───
  const levelDesc = operation !== 'Random' ? getLevelDescription(sessionLevel, operation as MathOperation) : '';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginBottom: '0', 
        padding: '0',
        paddingBottom: 0
      }}
    >
      {/* Top bar: change subject + level + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '0.5rem' }}>
        <button className="glass-panel" onClick={() => setOperation(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', fontSize: '0.85rem', flexShrink: 0 }}>
          <ArrowLeft size={14} /> Change Subject
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
          <div>Lvl <strong style={{ color: 'var(--primary)' }}>{sessionLevel}</strong></div>
          {levelDesc && <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{levelDesc}</div>}
        </div>
      </div>

      {/* Main question card */}
      <div className="card" style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        flex: 1, 
        minHeight: 0,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        border: isHelping ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
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
            {lastPoints.streakMultiplier > 1 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--danger)' }}>🔥 ×{lastPoints.streakMultiplier}</span>
            )}
          </motion.div>
        )}

        {/* Help Me / Step In buttons */}
        {question && !feedback && !isHelping && !isSteppingIn && divisionMode === null && (
          <div style={{ display: 'flex', gap: '1rem', zIndex: 10, position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }}>
            {question.op !== '/' && (
              <button 
                onClick={() => {
                  setAnswerInput('');
                  setIsHelping(true);
                  setIsSteppingIn(false);
                  setHelpStep(0);
                }}
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '2rem'
                }}
              >
                <HelpCircle size={16} /> Help Me
              </button>
            )}
            
            {question.op === '/' && (
              <button 
                onClick={() => {
                  setDivisionMode('help');
                }}
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '2rem'
                }}
              >
                <HelpCircle size={16} /> Help Me
              </button>
            )}
            
            {(question.op === '*' || question.op === '/') && (
              <button 
                onClick={() => {
                  if (question.op === '/') {
                    setDivisionMode('interactive');
                  } else {
                    setAnswerInput('');
                    setIsSteppingIn(true);
                    setIsHelping(false);
                    setHelpStep(0);
                  }
                }}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.2rem', height: '1.2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 800 }}>!</div> Step In
              </button>
            )}
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {question && (
            <motion.div key={`${question.num1}-${question.op}-${question.num2}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {question.op === '/' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <BusStopDivision 
                    question={question} 
                    onComplete={handleBusStopComplete} 
                    onInput={setBusStopInputHandler}
                    mode={divisionMode || 'interactive'}
                  />
                  {feedback === 'correct' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginTop: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                      <CheckCircle size={24} /> Awesome job!
                    </motion.div>
                  )}
                </div>
              ) : question.op === '*' && (isHelping || isSteppingIn) ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <MultiplicationHelp 
                    question={question} 
                    helpStep={helpStep} 
                    setHelpStep={setHelpStep} 
                    resetHelp={resetHelp} 
                    isInteractive={isSteppingIn}
                    onInput={setStepInInputHandler}
                    onComplete={() => {
                        handleCorrectAnswer(question.op);
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '180px', alignItems: 'flex-end', marginTop: isHelping ? '1.5rem' : 'auto', marginBottom: isHelping ? '0' : 'auto', transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <div style={{ fontSize: 'clamp(2.5rem, 6vh, 3.5rem)', fontWeight: 800, fontFamily: "'Fredoka One', cursive", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1', marginBottom: '1rem', width: '100%' }}>
                      {/* Exchange annotations row */}
                      {isHelping && question.op === '-' && helpStep >= 1 && helpExchangeAnnotations.some(a => a !== null) && (
                        <div style={{ 
                          paddingRight: 'calc(0.5rem + 10px)', 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          gap: '20px',
                          fontSize: '2.2rem',
                          lineHeight: 1,
                          marginBottom: '0.1rem'
                        }}>
                          {helpDigits1.map((_, i) => {
                            const annotation = helpExchangeAnnotations[i];
                            const colFromRight = helpDigits1.length - i;
                            const colStep = colFromRight;
                            const isVisible = annotation !== null;
                            const isActive = helpStep === colStep;
                            const isPast = helpStep > colStep;
                            return (
                              <span key={i} style={{ 
                                fontWeight: 700,
                                fontFamily: "'Fredoka One', cursive",
                                color: isActive ? 'var(--success)' : isPast ? 'rgba(255,255,255,0.3)' : 'var(--warning)',
                                opacity: isVisible ? 1 : 0,
                                transition: 'all 0.3s',
                                textAlign: 'right',
                                width: '1ch',
                                overflow: 'visible',
                                whiteSpace: 'nowrap'
                              }}>{annotation !== null ? annotation : '\u00A0'}</span>
                            );
                          })}
                        </div>
                      )}
                      {/* Num1 digits */}
                      <div style={{ 
                        paddingRight: '0.5rem', 
                        display: 'flex', 
                        justifyContent: 'flex-end'
                      }}>
                        {helpDigits1.map((d, i) => {
                          const colFromRight = helpDigits1.length - i;
                          const colStep = colFromRight;
                          const annotation = helpExchangeAnnotations[i];
                          const hasExchange = isHelping && question.op === '-' && annotation !== null && helpStep >= 1;
                          const isActive = isHelping && helpStep === colStep && !hasExchange;
                          return (
                            <span key={i} style={{ 
                              color: hasExchange ? 'rgba(255,255,255,0.2)' : (isActive ? 'var(--success)' : 'inherit'),
                              textDecoration: hasExchange ? 'line-through' : 'none',
                              textDecorationColor: 'var(--danger)',
                              transition: 'all 0.3s'
                            }}>{d}</span>
                          );
                        })}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        borderBottom: '6px solid var(--text-primary)', 
                        paddingBottom: '0.3rem', 
                        width: '100%', 
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: 'var(--primary)', paddingRight: '1rem', alignSelf: 'flex-end' }}>{question.op === '*' ? '×' : question.op}</span>
                        <div style={{ 
                          paddingRight: '0.5rem', 
                          display: 'flex', 
                          justifyContent: 'flex-end' 
                        }}>
                          {helpDigits2.map((d, i) => {
                            const idxFromRight = helpDigits2.length - 1 - i;
                            const colStep = idxFromRight + 1;
                            return (
                              <span key={i} style={{ 
                                color: isHelping && helpStep === colStep ? 'var(--success)' : 'inherit',
                                transition: 'color 0.3s'
                              }}>{d}</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      fontSize: 'clamp(2rem, 6vh, 3.5rem)', 
                      fontWeight: 800, 
                      fontFamily: "'Fredoka One', cursive", 
                      textAlign: 'right', 
                      padding: '0 0.5rem 0 0', 
                      height: 'clamp(3rem, 8vh, 4rem)', 
                      borderRadius: '0.75rem', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '2px solid rgba(255,255,255,0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      color: isHelping && helpStep > helpMaxLen ? 'var(--success-dark)' : 'inherit'
                    }}>
                      {isHelping && helpStep >= 1 ? (
                        helpStep > helpMaxLen ? (
                          <span style={{ color: 'var(--success-dark)' }}>{question.answer}</span>
                        ) : (
                          <div style={{ display: 'flex' }}>
                            {question.answer.toString().split('').map((d, i, arr) => {
                              const idxFromRight = arr.length - 1 - i;
                              const colStep = idxFromRight + 1;
                              const revealed = helpStep >= colStep || (colStep > helpMaxLen && helpStep >= helpMaxLen);
                              const isHighlighted = helpStep === colStep || (colStep > helpMaxLen && helpStep >= helpMaxLen);
                              return (
                                <span key={i} style={{ 
                                  opacity: revealed ? 1 : 0.15, 
                                  color: isHighlighted ? 'var(--success-dark)' : 'var(--text-primary)',
                                  transition: 'all 0.3s'
                                }}>{revealed ? d : '?'}</span>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        answerInput || <span style={{ opacity: 0.3 }}>?</span>
                      )}
                    </div>
                    {isHelping && question.op === '+' && helpStep >= 1 && helpStep <= helpMaxLen && (() => {
                      const prevCol = helpStep >= 2 ? helpColumns[helpStep - 2] : null;
                      const currentCol = helpColumns[helpStep - 1];
                      const showCarryFromPrev = prevCol && prevCol.carryOut > 0;
                      const showCarryFromCurrent = currentCol && currentCol.carryOut > 0;
                      if (!showCarryFromPrev && !showCarryFromCurrent) return null;
                      return (
                      <div style={{ 
                        paddingRight: '0.5rem', 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        marginTop: '0.2rem'
                      }}>
                        {question.answer.toString().split('').map((_, i, arr) => {
                          const idxFromRight = arr.length - 1 - i;
                          const colStep = idxFromRight + 1;
                          const isCurrentCarry = showCarryFromCurrent && colStep === helpStep + 1;
                          const isPrevCarry = showCarryFromPrev && colStep === helpStep;
                          const showCarry = (isCurrentCarry || isPrevCarry) && colStep <= helpMaxLen;
                          const carryVal = isCurrentCarry ? currentCol.carryOut : (isPrevCarry && prevCol ? prevCol.carryOut : 0);
                          return (
                            <span key={i} style={{ 
                              fontSize: 'clamp(2.5rem, 6vh, 3.5rem)', 
                              fontWeight: 800,
                              fontFamily: "'Fredoka One', cursive",
                              textAlign: 'center', width: '1ch', display: 'flex', justifyContent: 'center'
                            }}>
                              <span style={{
                                fontSize: '0.6em',
                                visibility: showCarry ? 'visible' : 'hidden',
                                color: isCurrentCarry ? 'var(--success-dark)' : 'var(--success)',
                                transition: 'color 0.3s'
                              }}>
                                {showCarry ? carryVal : '0'}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      );
                    })()}
                  </div>

                  {isHelping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        width: '100%',
                        marginTop: 'auto',
                        paddingBottom: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <div className="title-font" style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
                        {helpStep === 0 && "Let's solve it!"}
                        {helpStep >= 1 && helpStep <= helpMaxLen && helpColResult && (() => {
                          const basePval = Math.pow(10, helpStep - 1);
                          const actualD1 = helpColResult.d1 * basePval;
                          const actualD2 = helpColResult.d2 * basePval;
                          const actualBorrow = helpColResult.borrow * basePval;
                          const actualDisplayD1 = helpColResult.displayD1 * basePval;
                          const actualResult = helpColResult.result * basePval;
                          const renderFinalVal = (_res: number) => {
                             if (helpColResult.carryOut > 0 && question.op === '+') {
                               return (
                                 <>
                                   <span style={{ color: 'var(--pink)' }}>{helpColResult.carryOut}</span>
                                   <span style={{ color: 'var(--success-dark)' }}>{helpColResult.result - (helpColResult.carryOut * 10)}{basePval > 1 ? '0'.repeat(helpStep - 1) : ''}</span>
                                 </>
                               );
                             }
                             return <span style={{ color: 'var(--success-dark)' }}>{actualResult}</span>;
                          };

                          return (
                            <span style={{ color: 'var(--success)' }}>
                              {question.op === '+' ? (
                                <>
                                  {actualD1} <span style={{ color: 'var(--primary)' }}>+</span> {actualD2}
                                  {actualBorrow > 0 ? <> <span style={{ color: 'var(--primary)' }}>+</span> <span style={{ color: 'var(--pink)' }}>{actualBorrow}</span></> : ''}
                                  <span style={{ color: 'var(--primary)' }}> = </span>
                                </>
                              ) : (
                                <>
                                  {actualDisplayD1} <span style={{ color: 'var(--primary)' }}>−</span> {actualD2} <span style={{ color: 'var(--primary)' }}>=</span>{' '}
                                </>
                              )}
                              {renderFinalVal(actualResult)}
                            </span>
                          );
                        })()}
                        {helpStep > helpMaxLen && <span style={{ color: 'var(--success-dark)' }}>Answer: {question.answer}</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5, maxWidth: '260px' }}>
                        {helpStep === 0 && "Start from the ones"}
                        {helpStep >= 1 && helpStep <= helpMaxLen && helpColResult && (
                          question.op === '-' && helpColResult.borrowed
                            ? (() => {
                                const nextColD1 = helpStep < helpMaxLen ? parseInt(helpPad1[helpMaxLen - helpStep - 1]) || 0 : 0;
                                const basePval = Math.pow(10, helpStep - 1);
                                return `We take ${basePval * 10} from the ${nextColD1 * basePval * 10}, making it ${(nextColD1 - 1) * basePval * 10}. The ${helpColResult.d1 * basePval} becomes ${helpColResult.displayD1 * basePval}`;
                              })()
                            : `${helpColumnNames[helpStep - 1]} column`
                        )}
                        {helpStep > helpMaxLen && "All together!"}
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                        {helpStep > 1 && (
                          <button 
                            onClick={() => setHelpStep(prev => prev - 1)}
                            className="btn-primary" 
                            style={{ padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none', minWidth: '120px', justifyContent: 'center' }}
                          >
                            <ChevronLeft size={16} /> Back
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (helpStep < helpTotalSteps) setHelpStep(helpStep + 1);
                            else resetHelp();
                          }}
                          className="btn-primary" 
                          style={{ padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '2rem', minWidth: '120px', justifyContent: 'center' }}
                        >
                          {helpStep < helpTotalSteps ? 'Next' : 'Got it!'} <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                  {feedback && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginTop: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: feedback === 'correct' ? 'var(--success)' : 'var(--danger)' }}>
                      {feedback === 'correct' ? <><CheckCircle size={24} /> Awesome job!</> : <><XCircle size={24} /> Oops, try again!</>}
                    </motion.div>
                  )}
                </div>
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

      <MathKeypad 
        onInput={(val) => {
          if (feedback === 'correct') return;
          if (feedback === 'incorrect') setFeedback(null);
          if (operation === '/' && (divisionMode === 'interactive' || divisionMode === null)) busStopInputHandler?.(val);
          else if (isSteppingIn) stepInInputHandler?.(val);
          else if (operation !== '/' || divisionMode !== 'help') setAnswerInput(prev => prev + val);
        }}
        onClear={() => {
          if (feedback === 'correct') return;
          if (feedback === 'incorrect') setFeedback(null);
          if (operation === '/' && divisionMode === 'interactive') { /* Bus stop handles own state */ }
          else if (isSteppingIn) stepInInputHandler?.('DEL');
          else setAnswerInput(prev => prev.slice(0, -1));
        }}
        onSubmit={() => {
          if (isSteppingIn || operation === '/') return;
          handleSubmit();
        }}
        disabled={feedback === 'correct' || divisionMode === 'help'}
      />
    </motion.div>
  );
}
