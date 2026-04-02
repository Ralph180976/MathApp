import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, ChevronRight } from 'lucide-react';
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
  const [isHelping, setIsHelping] = useState(false);
  const [helpStep, setHelpStep] = useState(0);


  const resetHelp = () => {
    setIsHelping(false);
    setHelpStep(0);
  };

  // Help solver derived values (units → tens → hundreds, right-to-left)
  const helpDigits1 = question ? question.num1.toString().split('') : [];
  const helpDigits2 = question ? question.num2.toString().split('') : [];
  const helpMaxLen = Math.max(helpDigits1.length, helpDigits2.length);
  const helpPad1 = question ? question.num1.toString().padStart(helpMaxLen, '0').split('') : [];
  const helpPad2 = question ? question.num2.toString().padStart(helpMaxLen, '0').split('') : [];
  const helpTotalSteps = helpMaxLen + 1;
  const helpColumnNames = ['Units', 'Tens', 'Hundreds', 'Thousands'];
  const helpActiveColFromRight = helpStep >= 1 && helpStep <= helpMaxLen ? helpStep : -1;
  const helpActiveIdx = helpActiveColFromRight > 0 ? helpMaxLen - helpActiveColFromRight : -1;

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

  // Exchange annotations: for each digit position (left-to-right), the exchanged value if different from original
  const helpExchangeAnnotations: (number | null)[] = helpPad1.map((_, i) => {
    const colFromRight = helpMaxLen - i; // 1-indexed
    const colIdx = colFromRight - 1; // 0-indexed into helpColumns
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
    resetHelp();
    nextQuestion(op, levelToUse);
  };

  const nextQuestion = (op: Operation, level: number) => {
    setFeedback(null);
    setAnswerInput('');
    setQuestion(generateQuestion(level, op));
    setStartTime(Date.now());
    resetHelp();
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
        marginBottom: '0', 
        padding: '0',
        paddingBottom: 0
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <button className="glass-panel" onClick={() => setOperation(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Change Subject
        </button>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
          Level <strong style={{ color: 'var(--primary)' }}>{sessionLevel}</strong>
        </div>
      </div>

      <div className="card" style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        border: isHelping ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {question && (question.op === '+' || question.op === '-') && !feedback && !isHelping && (
          <button 
            onClick={() => setIsHelping(true)}
            style={{ 
              position: 'absolute', 
              bottom: '1rem', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              padding: '0.5rem 1rem', 
              fontSize: '0.9rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10,
              borderRadius: '2rem'
            }}
          >
            <HelpCircle size={16} /> Help Me
          </button>
        )}
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '180px', alignItems: 'flex-end', marginTop: isHelping ? '1.5rem' : 'auto', marginBottom: isHelping ? '0' : 'auto', transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: "'Fredoka One', cursive", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1', marginBottom: '1rem', width: '100%' }}>
                      {/* Exchange annotations row - shown above digits when subtracting with exchange */}
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
                      fontSize: '3.5rem', 
                      fontWeight: 800, 
                      fontFamily: "'Fredoka One', cursive", 
                      textAlign: 'right', 
                      padding: '0 0.5rem 0 0', 
                      height: '4rem', 
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
                      // Show carry from the previous column if it exists
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
                          // Show carry generated by current step (for next column)
                          const isCurrentCarry = showCarryFromCurrent && colStep === helpStep + 1;
                          // Show carry from previous step (being used in current column)
                          const isPrevCarry = showCarryFromPrev && colStep === helpStep;
                          const showCarry = (isCurrentCarry || isPrevCarry) && colStep <= helpMaxLen;
                          const carryVal = isCurrentCarry ? currentCol.carryOut : (isPrevCarry && prevCol ? prevCol.carryOut : 0);
                          return (
                            <span key={i} style={{ 
                              fontSize: '3.5rem', 
                              fontWeight: 800,
                              fontFamily: "'Fredoka One', cursive",
                              textAlign: 'center',
                              visibility: showCarry ? 'visible' : 'hidden',
                              color: isCurrentCarry ? 'var(--success-dark)' : 'var(--success)',
                              transition: 'color 0.3s'
                            }}>{showCarry ? carryVal : '0'}</span>
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
                        {helpStep >= 1 && helpStep <= helpMaxLen && helpColResult && (
                          <span style={{ color: 'var(--success)' }}>
                            {question.op === '+' ? (
                              <>
                                {helpColResult.d1} + {helpColResult.d2}
                                {helpColResult.borrow > 0 ? ` + ${helpColResult.borrow}` : ''}
                                {' = '}
                              </>
                            ) : (
                              <>
                                {helpColResult.displayD1} − {helpColResult.d2} ={' '}
                              </>
                            )}
                            <span style={{ color: 'var(--success-dark)' }}>{helpColResult.result}</span>
                          </span>
                        )}
                        {helpStep > helpMaxLen && <span style={{ color: 'var(--success-dark)' }}>Answer: {question.answer}</span>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5, maxWidth: '260px' }}>
                        {helpStep === 0 && "Start from the ones"}
                        {helpStep >= 1 && helpStep <= helpMaxLen && helpColResult && (
                          question.op === '-' && helpColResult.borrowed
                            ? (() => {
                                const nextColD1 = helpStep < helpMaxLen ? parseInt(helpPad1[helpMaxLen - helpStep - 1]) || 0 : 0;
                                return `We take 1 from the ${nextColD1}, making it ${nextColD1 - 1}. The ${helpColResult.d1} becomes ${helpColResult.displayD1}`;
                              })()
                            : `${helpColumnNames[helpStep - 1]} column`
                        )}
                        {helpStep > helpMaxLen && "All together!"}
                      </div>
                      <button 
                        onClick={() => {
                          if (helpStep < helpTotalSteps) setHelpStep(helpStep + 1);
                          else resetHelp();
                        }}
                        className="btn-primary" 
                        style={{ padding: '0.6rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '2rem' }}
                      >
                        {helpStep < helpTotalSteps ? 'Next' : 'Got it!'} <ChevronRight size={16} />
                      </button>
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
