import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../store';
import { MathKeypad } from '../components/MathKeypad';

type Operation = '+' | '-' | '*' | '/' | 'Random';

interface Question {
  num1: number;
  num2: number;
  op: '+' | '-' | '*' | '/';
  answer: number;
}

const generateQuestion = (level: number, selectedOp: Operation): Question => {
  let op = selectedOp;
  if (selectedOp === 'Random') {
    const ops: ('+' | '-' | '*' | '/')[] = ['+', '-', '*', '/'];
    op = ops[Math.floor(Math.random() * ops.length)];
  }

  let maxNum = Math.min(10 + level * 5, 100);
  let minNum = Math.max(1, Math.floor(level / 2));

  let num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  let num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

  if (op === '-') {
    if (num1 < num2) [num1, num2] = [num2, num1]; // Keep positive for now
  } else if (op === '/') {
    const maxDivisor = Math.min(12, 2 + Math.floor(level / 2));
    const divisor = Math.max(2, Math.floor(Math.random() * (maxDivisor - 1)) + 2);
    const dividendMulti = Math.floor(Math.random() * (10 + level * 5)) + 5;
    let dividend = divisor * dividendMulti + Math.floor(Math.random() * divisor); 
    if (level < 3) dividend = Math.min(dividend, 50);
    
    num2 = divisor;
    num1 = dividend;
  } else if (op === '*') {
    maxNum = Math.min(5 + level * 2, 20);
    num1 = Math.floor(Math.random() * maxNum) + 1;
    num2 = Math.floor(Math.random() * maxNum) + 1;
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

const BusStopDivision = ({ question, onComplete, onInput }: { question: Question, onComplete: () => void, onInput: (fn: ((val: string) => void) | null) => void }) => {
  const digits = question.num1.toString().split('');
  const divisor = question.num2;

  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState<'quotient' | 'remainder' | 'final_remainder' | 'done'>('quotient');
  
  const [quotients, setQuotients] = useState<string[]>(Array(digits.length).fill(''));
  const [remainders, setRemainders] = useState<string[]>(Array(digits.length).fill(''));
  const [finalRemainder, setFinalRemainder] = useState<string>('');

  const currentVal = parseInt((remainders[activeStep] || '') + digits[activeStep], 10);
  const expectedQ = Math.floor(currentVal / divisor).toString();
  const expectedR = (currentVal % divisor).toString();

  useEffect(() => {
    const handler = (val: string) => {
      if (phase === 'done') return;
      
      if (phase === 'quotient') {
        if (val === expectedQ) {
          const newQ = [...quotients];
          newQ[activeStep] = val;
          setQuotients(newQ);
          
          if (expectedR !== '0') {
            if (activeStep < digits.length - 1) {
              setPhase('remainder');
            } else {
              setPhase('final_remainder');
            }
          } else {
            if (activeStep < digits.length - 1) {
              setActiveStep(activeStep + 1);
            } else {
              setPhase('done');
              setTimeout(onComplete, 500);
            }
          }
        }
      } else if (phase === 'remainder') {
        if (val === expectedR) {
          const newR = [...remainders];
          newR[activeStep + 1] = val;
          setRemainders(newR);
          setActiveStep(activeStep + 1);
          setPhase('quotient');
        }
      } else if (phase === 'final_remainder') {
        if (val === expectedR) {
          setFinalRemainder(val);
          setPhase('done');
          setTimeout(onComplete, 500);
        }
      }
    };
    onInput(() => handler);
    return () => onInput(null);
  }, [phase, activeStep, quotients, remainders, finalRemainder, expectedQ, expectedR, digits.length, divisor, onComplete, onInput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Fredoka One', cursive", flex: 1, justifyContent: 'center' }}>
      <div style={{ display: 'flex', marginLeft: '2.5rem', marginBottom: '0.2rem' }}>
        {digits.map((_, i) => (
          <div key={i} style={{ width: '4rem', height: '4.5rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', fontSize: '3.5rem', color: 'var(--success)' }}>
            {quotients[i] !== '' ? quotients[i] : (activeStep === i && phase === 'quotient') ? (
              <div className="animate-pulse-ring" style={{ width: '3.5rem', height: '4rem', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'white', border: '2px dashed var(--success)', borderRadius: '8px' }}>
                 ?
              </div>
            ) : null}
          </div>
        ))}
        <div style={{ minWidth: '4rem', display: 'flex', alignItems: 'flex-end', marginLeft: '0.5rem', color: 'var(--warning)', fontSize: '2.5rem', paddingBottom: '0.4rem' }}>
          {(phase === 'final_remainder' || finalRemainder !== '') && 'r '}
          {(phase === 'final_remainder' && finalRemainder === '') ? (
             <div className="animate-pulse-ring" style={{ width: '4.5rem', height: '3.5rem', fontSize: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: 'white', border: '2px dashed var(--warning)', borderRadius: '8px', marginLeft: '0.2rem' }}>?</div>
          ) : finalRemainder}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ paddingRight: '1rem', fontSize: '4.5rem', color: 'var(--primary)' }}>
          {divisor}
        </div>
        <div style={{ display: 'flex', borderTop: '6px solid var(--text-primary)', borderLeft: '6px solid var(--text-primary)', padding: '0.5rem 1rem 0.5rem 0.5rem', borderTopLeftRadius: '16px' }}>
          {digits.map((digit, i) => (
             <div key={`div-${i}`} style={{ width: '4rem', position: 'relative', fontSize: '4.5rem', textAlign: 'center' }}>
               {remainders[i] && (
                 <span style={{ position: 'absolute', top: '0.8rem', left: '-1rem', fontSize: '2rem', color: 'var(--warning)', letterSpacing: '-1px' }}>{remainders[i]}</span>
               )}
               {(activeStep === i - 1 && phase === 'remainder') && (
                 <div className="animate-pulse-ring" style={{ position: 'absolute', top: '0.5rem', left: '-1.5rem', width: '3.5rem', height: '2.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', border: '2px dashed var(--warning)', borderRadius: '4px', zIndex: 10 }}>r?</div>
               )}
               {digit}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MathApp() {
  const navigate = useNavigate();
  const { currentUser, updateLevel } = useAppContext();
  
  const [operation, setOperation] = useState<Operation | null>(null);
  const [sessionLevel, setSessionLevel] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [busStopInputHandler, setBusStopInputHandler] = useState<((val: string) => void) | null>(null);

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
    nextQuestion(op, levelToUse);
  };

  const nextQuestion = (op: Operation, level: number) => {
    setFeedback(null);
    setAnswerInput('');
    setQuestion(generateQuestion(level, op));
    setStartTime(Date.now());
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

    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = parseFloat(answerInput) === question.answer;

    if (isCorrect) {
      setFeedback('correct');
      if (timeTaken < 8) handleLevelChange(1);
      setTimeout(() => nextQuestion(operation!, sessionLevel), 1500);
    } else {
      setFeedback('incorrect');
      handleLevelChange(-1);
    }
  };

  const handleBusStopComplete = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    setFeedback('correct');
    if (timeTaken < 20) handleLevelChange(1);
    setTimeout(() => nextQuestion(operation!, sessionLevel), 1500);
  };

  if (!operation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button className="glass-panel" onClick={() => navigate('/')} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="title-font gradient-text" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>Select Subject</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
          {['+', '-', '*', '/', 'Random'].map((op) => (
            <button key={op} className="card" onClick={() => startGame(op as Operation)} style={{ fontSize: '1.2rem', padding: '1.5rem 1rem', background: 'var(--surface-hover)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', gridColumn: op === 'Random' ? 'span 2' : 'auto' }}>
              <span style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{op === '+' ? '➕' : op === '-' ? '➖' : op === '*' ? '✖️' : op === '/' ? '➗' : '🎲'}</span>
              <span className="title-font">{op === 'Random' ? 'Random Match' : op === '+' ? 'Addition' : op === '-' ? 'Subtraction' : op === '*' ? 'Multiplication' : 'Division'}</span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginBottom: '-1rem', // Break out of main padding to hit the bottom edge
        padding: '1rem',
        paddingBottom: 0
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="glass-panel" onClick={() => setOperation(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Change Subject
        </button>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '2rem' }}>
          Level <strong style={{ color: 'var(--primary)' }}>{sessionLevel}</strong>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {question && (
            <motion.div key={`${question.num1}-${question.op}-${question.num2}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {question.op === '/' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <BusStopDivision question={question} onComplete={handleBusStopComplete} onInput={setBusStopInputHandler} />
                  {feedback === 'correct' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginTop: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                      <CheckCircle size={24} /> Awesome job!
                    </motion.div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '180px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: "'Fredoka One', cursive", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1', marginBottom: '1rem', width: '100%' }}>
                      <div style={{ paddingRight: '0.5rem' }}>{question.num1}</div>
                      <div style={{ display: 'flex', borderBottom: '6px solid var(--text-primary)', paddingBottom: '0.3rem', width: '100%', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--primary)', paddingRight: '1rem', alignSelf: 'flex-end' }}>{question.op === '*' ? '×' : question.op}</span>
                        <span style={{ paddingRight: '0.5rem' }}>{question.num2}</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', fontSize: '3rem', fontFamily: "'Fredoka One', cursive", textAlign: 'right', padding: '0 0.5rem 0 0', height: '4rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {answerInput || <span style={{ opacity: 0.3 }}>?</span>}
                    </div>
                  </div>
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

      <MathKeypad 
        onInput={(val) => {
          if (feedback === 'correct') return;
          if (operation === '/') busStopInputHandler?.(val);
          else setAnswerInput(prev => prev + val);
        }}
        onClear={() => {
          if (feedback === 'correct') return;
          if (operation !== '/') setAnswerInput(prev => prev.slice(0, -1));
        }}
        onSubmit={handleSubmit}
        disabled={feedback === 'correct'}
      />
    </motion.div>
  );
}
