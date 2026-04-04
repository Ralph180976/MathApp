import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Question {
  num1: number;
  num2: number;
  op: '+' | '-' | '*' | '/';
  answer: number;
}

interface Props {
  question: Question;
  helpStep: number;
  setHelpStep: (step: number) => void;
  resetHelp: () => void;
  isInteractive?: boolean;
  onInput?: (fn: ((val: string) => void) | null) => void;
  onComplete?: () => void;
}

// Decompose a number into place-value parts
// e.g. 12 -> [{digit: 2, placeValue: 1, value: 2}, {digit: 1, placeValue: 10, value: 10}]
// e.g. 345 -> [{digit: 5, placeValue: 1, value: 5}, {digit: 4, placeValue: 10, value: 40}, {digit: 3, placeValue: 100, value: 300}]
function decompose(n: number): { digit: number; placeValue: number; value: number; digitIndex: number }[] {
  const str = n.toString();
  const parts: { digit: number; placeValue: number; value: number; digitIndex: number }[] = [];
  for (let i = str.length - 1; i >= 0; i--) {
    const d = parseInt(str[i]);
    if (d === 0) continue; // skip zero digits
    const pv = Math.pow(10, str.length - 1 - i);
    parts.push({ digit: d, placeValue: pv, value: d * pv, digitIndex: i });
  }
  return parts;
}

interface PartialProductStep {
  // Which digit indices to highlight in num1 and num2
  topDigitIndex: number;
  bottomDigitIndex: number;
  // The actual values being multiplied (with place value)
  topValue: number;
  bottomValue: number;
  // The product
  product: number;
  // Description for the child
  label: string;
}

function buildPartialProducts(num1: number, num2: number): PartialProductStep[] {
  const parts1 = decompose(num1);
  const parts2 = decompose(num2);
  const steps: PartialProductStep[] = [];

  // Order: units×units first, then cross products ordered by total place value, then tens×tens, etc.
  // We build all combinations and sort by combined place value (ascending)
  const allPairs: { p1: typeof parts1[0]; p2: typeof parts2[0]; combinedPV: number }[] = [];
  
  for (const p2 of parts2) {
    for (const p1 of parts1) {
      allPairs.push({ p1, p2, combinedPV: p1.placeValue * p2.placeValue });
    }
  }

  // Sort by combined place value (smallest first = units×units first)
  allPairs.sort((a, b) => a.combinedPV - b.combinedPV);

  for (const pair of allPairs) {
    const product = pair.p1.value * pair.p2.value;
    steps.push({
      topDigitIndex: pair.p1.digitIndex,
      bottomDigitIndex: pair.p2.digitIndex,
      topValue: pair.p1.value,
      bottomValue: pair.p2.value,
      product,
      label: `${pair.p1.value} × ${pair.p2.value}`
    });
  }

  return steps;
}

export const LongMultiplication: React.FC<Props> = ({ question, helpStep, setHelpStep, resetHelp, isInteractive, onInput, onComplete }) => {
  const [interactiveValues, setInteractiveValues] = useState<Record<string, string>>({});
  const [shakeBoxId, setShakeBoxId] = useState<string | null>(null);

  // Reset on question change
  useEffect(() => {
    setInteractiveValues({});
    setShakeBoxId(null);
  }, [question]);

  // Reset values when step changes
  useEffect(() => {
    setShakeBoxId(null);
  }, [helpStep]);

  const topStr = question.num1.toString();
  const bottomStr = question.num2.toString();

  const partialProducts = useMemo(() => buildPartialProducts(question.num1, question.num2), [question]);

  // Phase structure:
  // Step 0: "Let's solve it!" intro
  // Steps 1..N: partial product steps (one per pair)
  // Step N+1: "Now add them together!" 
  // Step N+2: Addition result entered
  const numPartialSteps = partialProducts.length;
  const additionStep = numPartialSteps + 1;
  const finishStep = numPartialSteps + 2;
  const totalSteps = finishStep;

  // Compute the addition with carries
  const additionResult = useMemo(() => {
    const products = partialProducts.map(p => p.product);
    const sum = products.reduce((a, b) => a + b, 0);
    return sum;
  }, [partialProducts]);


  // Determine current step info
  const isIntro = helpStep === 0;
  const isPartialStep = helpStep >= 1 && helpStep <= numPartialSteps;
  const isAddition = helpStep === additionStep;
  const isFinish = helpStep >= finishStep;

  const currentPartial = isPartialStep ? partialProducts[helpStep - 1] : null;

  // Get expected value for current step
  const getExpectedValue = (): string | null => {
    if (isPartialStep && currentPartial) {
      return currentPartial.product.toString();
    }
    if (isAddition) {
      return additionResult.toString();
    }
    return null;
  };

  const currentBoxId = isPartialStep ? `partial_${helpStep}` : isAddition ? 'addition_result' : null;
  const expectedValue = getExpectedValue();

  // Handle interactive input
  useEffect(() => {
    if (!isInteractive || !onInput) return;

    if (!currentBoxId || !expectedValue) {
      onInput(null);
      // Auto-advance start step
      if (isIntro) {
        const timer = setTimeout(() => setHelpStep(1), 500);
        return () => clearTimeout(timer);
      }
      // Auto-advance finish step (already done)
      return;
    }

    const currentVal = interactiveValues[currentBoxId] || '';
    
    // Check if already filled correctly
    if (currentVal === expectedValue) {
      const timer = setTimeout(() => {
        if (helpStep < totalSteps) {
          setHelpStep(helpStep + 1);
        } else if (onComplete) {
          onComplete();
        }
      }, 600);
      return () => clearTimeout(timer);
    }

    const handler = (val: string) => {
      if (val === 'DEL') {
        setInteractiveValues(prev => {
          const cur = prev[currentBoxId] || '';
          return { ...prev, [currentBoxId]: cur.slice(0, -1) };
        });
        return;
      }
      
      setInteractiveValues(prev => {
        const cur = (prev[currentBoxId] || '') + val;
        // Check if it matches the expected value
        if (cur === expectedValue) {
          return { ...prev, [currentBoxId]: cur };
        }
        // Check if it's a valid prefix of the expected value
        if (expectedValue!.startsWith(cur)) {
          return { ...prev, [currentBoxId]: cur };
        }
        // Wrong input - shake
        setShakeBoxId(currentBoxId);
        setTimeout(() => setShakeBoxId(null), 500);
        return prev;
      });
    };

    onInput(() => handler);
    return () => { if (onInput) onInput(null); };
  }, [helpStep, isInteractive, currentBoxId, expectedValue, interactiveValues, onInput, onComplete, totalSteps]);

  const handleNext = () => {
    if (helpStep < totalSteps) {
      setHelpStep(helpStep + 1);
    } else {
      if (isInteractive && onComplete) onComplete();
      else resetHelp();
    }
  };

  const handleBack = () => {
    if (helpStep > 1) {
      setHelpStep(helpStep - 1);
    }
  };

  // Render a single input/display box
  const renderBox = (boxId: string, value: string, isActive: boolean, isCorrect: boolean, fontSize: string = 'clamp(1.5rem, 4vh, 2.5rem)') => {
    const displayValue = interactiveValues[boxId] || '';
    const isShaking = shakeBoxId === boxId;
    
    if (isInteractive) {
      return (
        <motion.div
          animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            minWidth: '3.5rem',
            height: 'clamp(2.5rem, 5vh, 3.5rem)',
            borderRadius: '0.75rem',
            border: isActive ? '2px solid var(--primary)' : isCorrect ? '2px solid var(--success)' : '2px solid rgba(255,255,255,0.15)',
            background: isActive ? 'rgba(59, 130, 246, 0.1)' : isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 800,
            fontFamily: "'Fredoka One', cursive",
            color: isCorrect ? 'var(--success)' : 'var(--text-primary)',
            padding: '0 0.8rem',
            transition: 'all 0.3s',
            boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none',
          }}
        >
          {isCorrect ? value : (displayValue || (isActive ? (
            <span className="animate-pulse-ring" style={{ opacity: 0.4, fontSize: '0.8em' }}>?</span>
          ) : ''))}
        </motion.div>
      );
    }

    // Non-interactive (help mode) just shows values progressively
    return (
      <div style={{
        minWidth: '3.5rem',
        height: 'clamp(2.5rem, 5vh, 3.5rem)',
        borderRadius: '0.75rem',
        border: isCorrect ? '2px solid var(--success)' : '2px solid rgba(255,255,255,0.15)',
        background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 800,
        fontFamily: "'Fredoka One', cursive",
        color: isCorrect ? 'var(--success)' : 'rgba(255,255,255,0.3)',
        padding: '0 0.8rem',
        transition: 'all 0.3s',
      }}>
        {isCorrect ? value : '?'}
      </div>
    );
  };

  // Which partial products are revealed so far
  const revealedUpTo = isPartialStep ? helpStep : (isAddition || isFinish ? numPartialSteps : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: 0, paddingBottom: '0.5rem' }}>
        
        {/* The main sum at the top: num1 × num2 */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '280px', 
          alignItems: 'flex-end', marginTop: '1rem',
          transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}>
          <div style={{ 
            fontSize: 'clamp(1.8rem, 4.5vh, 3rem)', fontWeight: 800, fontFamily: "'Fredoka One', cursive", 
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1', 
            width: '100%' 
          }}>
            {/* Top number with highlighting */}
            <div style={{ paddingRight: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              {topStr.split('').map((d, i) => {
                const isHighlighted = isPartialStep && currentPartial && currentPartial.topDigitIndex === i;
                return (
                  <span key={i} style={{ 
                    color: isHighlighted ? 'var(--success)' : 'inherit',
                    textShadow: isHighlighted ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    {d}
                  </span>
                );
              })}
            </div>

            {/* Bottom number with × sign and line */}
            <div style={{ 
              display: 'flex', borderBottom: '5px solid var(--text-primary)', 
              paddingBottom: '0.4rem', width: '100%', justifyContent: 'space-between' 
            }}>
              <span style={{ color: 'var(--primary)', paddingRight: '1rem', alignSelf: 'flex-end' }}>×</span>
              <div style={{ paddingRight: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                {bottomStr.split('').map((d, i) => {
                  const isHighlighted = isPartialStep && currentPartial && currentPartial.bottomDigitIndex === i;
                  return (
                    <span key={i} style={{ 
                      color: isHighlighted ? 'var(--success)' : 'inherit',
                      textShadow: isHighlighted ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Partial product rows */}
          <div style={{ width: '100%', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {partialProducts.map((pp, idx) => {
              const stepNum = idx + 1;
              const isRevealed = stepNum <= revealedUpTo;
              const isCurrent = isPartialStep && helpStep === stepNum;
              const isComplete = stepNum < helpStep || isAddition || isFinish;
              const boxId = `partial_${stepNum}`;
              const currentVal = interactiveValues[boxId] || '';
              const isCorrectlyFilled = currentVal === pp.product.toString();

              if (!isRevealed && !isCurrent) return null;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '0.5rem',
                  }}
                >
                  {/* The calculation label */}
                  <div style={{
                    fontSize: 'clamp(0.8rem, 1.8vh, 1rem)',
                    color: isCurrent ? 'var(--success)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Fredoka One', cursive",
                    transition: 'color 0.3s',
                    minWidth: '0',
                    flexShrink: 1,
                  }}>
                    {pp.topValue} × {pp.bottomValue} =
                  </div>

                  {/* The answer box */}
                  <div style={{ flexShrink: 0 }}>
                    {renderBox(
                      boxId,
                      pp.product.toString(),
                      isCurrent && !isComplete,
                      isComplete || isCorrectlyFilled,
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Addition section - appears after all partial products */}
          {(isAddition || isFinish) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', marginTop: '0.4rem' }}
            >
              {/* Separator line */}
              <div style={{ 
                borderTop: '5px solid var(--text-primary)',
                width: '100%',
                marginBottom: '0.5rem',
              }} />
              
              {/* "Add together" label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '0.5rem',
              }}>
                <div style={{
                  fontSize: 'clamp(0.8rem, 1.8vh, 1rem)',
                  color: isAddition ? 'var(--primary)' : 'var(--success)',
                  fontFamily: "'Fredoka One', cursive",
                  whiteSpace: 'nowrap',
                }}>
                  Add together =
                </div>
                
                <div style={{ flexShrink: 0 }}>
                  {renderBox(
                    'addition_result',
                    additionResult.toString(),
                    isAddition,
                    isFinish || (interactiveValues['addition_result'] === additionResult.toString()),
                    'clamp(1.5rem, 4vh, 2.5rem)',
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Explanatory Text */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div className="title-font" style={{ fontSize: 'clamp(1.1rem, 2.5vh, 1.4rem)', marginBottom: '0.3rem', color: 'var(--primary)', textAlign: 'center' }}>
          {isIntro && "Let's solve it step by step!"}
          {isPartialStep && currentPartial && (
            <span style={{ color: 'var(--success)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{currentPartial.topValue}</span>
              <span style={{ color: 'var(--primary)' }}> × </span>
              <span style={{ color: 'var(--text-primary)' }}>{currentPartial.bottomValue}</span>
              <span style={{ color: 'var(--primary)' }}> = </span>
              {isInteractive ? (
                <span style={{ color: 'var(--text-secondary)' }}>?</span>
              ) : (
                <span style={{ color: 'var(--success)' }}>{currentPartial.product}</span>
              )}
            </span>
          )}
          {isAddition && (
            <span>
              Now add them all together!
            </span>
          )}
          {isFinish && (
            <span style={{ color: 'var(--success)' }}>
              Answer: {question.answer} ✓
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5, maxWidth: '260px', textAlign: 'center' }}>
          {isIntro && "We'll break it into small steps."}
          {isPartialStep && currentPartial && (() => {
            const topPVName = currentPartial.topValue >= 100 ? 'hundreds' : currentPartial.topValue >= 10 ? 'tens' : 'units';
            const bottomPVName = currentPartial.bottomValue >= 100 ? 'hundreds' : currentPartial.bottomValue >= 10 ? 'tens' : 'units';
            return `Multiply the ${topPVName} of ${question.num1} by the ${bottomPVName} of ${question.num2}`;
          })()}
          {isAddition && (
            <>
              {partialProducts.map(p => p.product).join(' + ')} = ?
            </>
          )}
          {isFinish && "All done! Great work! 🎉"}
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', padding: '0.8rem 0 0.5rem', background: 'var(--surface)', zIndex: 10, width: '100%' }}>
        {helpStep > 1 && !isInteractive && (
          <button onClick={handleBack} className="btn-primary" style={{ 
            padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', 
            borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none', 
            minWidth: '120px', justifyContent: 'center' 
          }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        
        {(!isInteractive || isIntro || isFinish) && (
          <button onClick={handleNext} className="btn-primary" style={{ 
            padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', 
            borderRadius: '2rem', minWidth: '120px', justifyContent: 'center' 
          }}>
            {helpStep < totalSteps ? 'Next' : 'Got it!'} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
