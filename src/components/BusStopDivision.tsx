import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Question {
  num1: number;
  num2: number;
  op: '+' | '-' | '*' | '/';
  answer: number;
}

interface Props {
  question: Question;
  onComplete: () => void;
  onInput: (fn: ((val: string) => void) | null) => void;
  mode: 'interactive' | 'help';
}

// Pre-compute all the steps for a bus stop division
interface DivisionStep {
  digitIndex: number;       // which digit of the dividend we're at
  digit: number;            // the raw digit at this position
  carryIn: number;          // remainder carried from previous step
  workingNumber: number;    // carryIn * 10 + digit (what we're dividing)
  quotientDigit: number;    // result of workingNumber ÷ divisor
  remainder: number;        // workingNumber - (quotientDigit * divisor)
  isLeadingZero: boolean;   // if quotient digit is 0 and we haven't started yet
}

function computeSteps(dividend: number, divisor: number): DivisionStep[] {
  const digits = dividend.toString().split('').map(Number);
  const steps: DivisionStep[] = [];
  let carry = 0;
  let started = false;

  for (let i = 0; i < digits.length; i++) {
    const workingNumber = carry * 10 + digits[i];
    const q = Math.floor(workingNumber / divisor);
    const r = workingNumber % divisor;
    
    if (q > 0) started = true;
    
    steps.push({
      digitIndex: i,
      digit: digits[i],
      carryIn: carry,
      workingNumber,
      quotientDigit: q,
      remainder: r,
      isLeadingZero: !started && q === 0,
    });
    
    carry = r;
  }
  
  return steps;
}

// ─── Phase tracking for interactive mode ───
// Each step has sub-phases the child must complete:
//   1. 'quotient' — enter the quotient digit
//   2. 'remainder' — enter the remainder (carry) if non-zero and not the last step

type SubPhase = 'quotient' | 'remainder';

export const BusStopDivision: React.FC<Props> = ({ question, onComplete, onInput, mode }) => {
  const dividend = question.num1;
  const divisor = question.num2;
  const digits = useMemo(() => dividend.toString().split('').map(Number), [dividend]);
  const steps = useMemo(() => computeSteps(dividend, divisor), [dividend, divisor]);
  
  // Final remainder for the whole division
  const finalRemainder = steps.length > 0 ? steps[steps.length - 1].remainder : 0;
  const quotient = Math.floor(dividend / divisor);
  
  // ─── Interactive state ───
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>('quotient');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [quotientValues, setQuotientValues] = useState<Record<number, string>>({});
  const [remainderValues, setRemainderValues] = useState<Record<number, string>>({});
  const [finalRemainderValue, setFinalRemainderValue] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [shakeTarget, setShakeTarget] = useState<string | null>(null);
  
  // ─── Help mode state ───
  const [helpStep, setHelpStep] = useState(0);
  // helpStep 0 = intro
  // helpStep 1..N = each digit step
  // helpStep N+1 = final remainder (if any)
  // helpStep N+2 (or N+1 if no remainder) = done!
  const totalHelpSteps = steps.length + (finalRemainder > 0 ? 1 : 0) + 1; // +1 for intro
  
  // Skip leading zeros in help mode

  // Reset on question change
  useEffect(() => {
    setActiveStepIndex(0);
    setSubPhase('quotient');
    setCompletedSteps(new Set());
    setQuotientValues({});
    setRemainderValues({});
    setFinalRemainderValue('');
    setIsComplete(false);
    setShakeTarget(null);
    setHelpStep(0);
  }, [question]);

  const doShake = useCallback((target: string) => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 500);
  }, []);

  // ─── Interactive input handler ───
  useEffect(() => {
    if (mode !== 'interactive') {
      onInput(null);
      return;
    }
    if (isComplete) {
      onInput(null);
      return;
    }

    const currentStep = steps[activeStepIndex];
    if (!currentStep) return;

    const handler = (val: string) => {
      if (isComplete) return;

      if (subPhase === 'quotient') {
        const expected = currentStep.quotientDigit.toString();
        if (val === expected) {
          // Correct quotient digit
          setQuotientValues(prev => ({ ...prev, [activeStepIndex]: val }));
          
          // Check what's next
          if (currentStep.remainder > 0) {
            if (activeStepIndex < steps.length - 1) {
              // Has a remainder to carry — ask for it
              setSubPhase('remainder');
            } else {
              // Last digit with remainder — ask for final remainder
              setSubPhase('remainder');
            }
          } else {
            // No remainder — mark complete and move on
            setCompletedSteps(prev => new Set(prev).add(activeStepIndex));
            if (activeStepIndex < steps.length - 1) {
              setActiveStepIndex(prev => prev + 1);
              setSubPhase('quotient');
            } else {
              // All done!
              setIsComplete(true);
              setTimeout(onComplete, 800);
            }
          }
        } else {
          doShake(`q-${activeStepIndex}`);
        }
      } else if (subPhase === 'remainder') {
        const expected = currentStep.remainder.toString();
        
        if (activeStepIndex === steps.length - 1) {
          // Final remainder
          const currentVal = finalRemainderValue + val;
          if (currentVal === expected) {
            setFinalRemainderValue(currentVal);
            setCompletedSteps(prev => new Set(prev).add(activeStepIndex));
            setIsComplete(true);
            setTimeout(onComplete, 800);
          } else if (expected.startsWith(currentVal)) {
            setFinalRemainderValue(currentVal);
          } else {
            doShake('final-r');
          }
        } else {
          // Intermediate remainder (carry)
          if (val === expected) {
            setRemainderValues(prev => ({ ...prev, [activeStepIndex]: val }));
            setCompletedSteps(prev => new Set(prev).add(activeStepIndex));
            setActiveStepIndex(prev => prev + 1);
            setSubPhase('quotient');
          } else {
            doShake(`r-${activeStepIndex}`);
          }
        }
      }
    };

    onInput(() => handler);
    return () => onInput(null);
  }, [mode, activeStepIndex, subPhase, isComplete, steps, finalRemainderValue, onComplete, onInput, doShake]);

  // ─── Helper: determine what's visible at current help step ───
  const getHelpVisibility = (stepIdx: number) => {
    if (mode !== 'help') return { showQuotient: completedSteps.has(stepIdx) || quotientValues[stepIdx] !== undefined, showRemainder: completedSteps.has(stepIdx), isActive: activeStepIndex === stepIdx };
    
    // helpStep 0 = intro (nothing revealed)
    // helpStep 1 = first digit step, etc.
    const helpStepForThis = stepIdx + 1; // 1-indexed
    return {
      showQuotient: helpStep >= helpStepForThis,
      showRemainder: helpStep >= helpStepForThis,
      isActive: helpStep === helpStepForThis,
    };
  };

  // ─── Current step info for guidance text ───
  const currentStep = mode === 'interactive' ? steps[activeStepIndex] : (helpStep >= 1 && helpStep <= steps.length ? steps[helpStep - 1] : null);

  // ─── Build guidance text ───
  const getGuidanceTitle = () => {
    if (mode === 'help') {
      if (helpStep === 0) return "Let's divide step by step!";
      if (helpStep > steps.length) {
        if (finalRemainder > 0 && helpStep === steps.length + 1) {
          return `Remainder: ${finalRemainder}`;
        }
        return `${dividend} ÷ ${divisor} = ${quotient}${finalRemainder > 0 ? ` r ${finalRemainder}` : ''}`;
      }
      if (currentStep) {
        const step = currentStep;
        return (
          <span>
            {step.carryIn > 0 && (
              <span style={{ color: 'var(--warning)' }}>{step.carryIn}</span>
            )}
            <span>{step.carryIn > 0 ? step.digit : ''}</span>
            {step.carryIn > 0 ? ` = ${step.workingNumber}` : `${step.workingNumber}`}
            <span style={{ color: 'var(--primary)' }}> ÷ </span>
            <span>{divisor}</span>
            <span style={{ color: 'var(--primary)' }}> = </span>
            <span style={{ color: 'var(--success)' }}>{step.quotientDigit}</span>
            {step.remainder > 0 && (
              <span style={{ color: 'var(--warning)' }}> r {step.remainder}</span>
            )}
          </span>
        );
      }
    }
    
    // Interactive mode
    if (isComplete) {
      return <span style={{ color: 'var(--success)' }}>
        {dividend} ÷ {divisor} = {quotient}{finalRemainder > 0 ? ` r ${finalRemainder}` : ''} ✓
      </span>;
    }
    
    if (!currentStep) return '';
    
    if (subPhase === 'quotient') {
      if (currentStep.carryIn > 0) {
        return (
          <span>
            How many <span style={{ color: 'var(--primary)' }}>{divisor}</span>s in{' '}
            <span style={{ color: 'var(--warning)' }}>{currentStep.carryIn}</span>
            <span>{currentStep.digit}</span> = <span style={{ fontWeight: 800 }}>{currentStep.workingNumber}</span>?
          </span>
        );
      }
      return (
        <span>
          How many <span style={{ color: 'var(--primary)' }}>{divisor}</span>s in{' '}
          <span style={{ fontWeight: 800 }}>{currentStep.workingNumber}</span>?
        </span>
      );
    }
    
    if (subPhase === 'remainder') {
      if (activeStepIndex === steps.length - 1) {
        return (
          <span>
            What's the final remainder?
          </span>
        );
      }
      return (
        <span>
          What's left over? ({currentStep.workingNumber} − {currentStep.quotientDigit * divisor} = ?)
        </span>
      );
    }
    
    return '';
  };

  const getGuidanceSubtext = () => {
    if (mode === 'help') {
      if (helpStep === 0) return 'We work left to right, one digit at a time.';
      if (helpStep > steps.length) {
        if (finalRemainder > 0 && helpStep === steps.length + 1) {
          return `${currentStep ? currentStep.workingNumber : ''} can't be divided by ${divisor} any more.`;
        }
        return 'All done! Great work! 🎉';
      }
      if (currentStep) {
        if (currentStep.isLeadingZero) {
          return `${divisor} doesn't go into ${currentStep.workingNumber}, so carry it forward.`;
        }
        if (currentStep.carryIn > 0) {
          return `The ${currentStep.carryIn} from before makes it ${currentStep.workingNumber}.`;
        }
        return `${divisor} goes into ${currentStep.workingNumber} exactly ${currentStep.quotientDigit} time${currentStep.quotientDigit !== 1 ? 's' : ''}.`;
      }
    }
    
    if (isComplete) return 'Brilliant! 🎉';
    if (!currentStep) return '';
    
    if (subPhase === 'quotient') {
      if (currentStep.isLeadingZero && mode === 'interactive') {
        return `${divisor} doesn't fit — type 0`;
      }
      // Show a hint: the times table
      const q = currentStep.quotientDigit;
      return `${divisor} × ${q} = ${divisor * q}`;
    }
    
    if (subPhase === 'remainder') {
      if (activeStepIndex === steps.length - 1) {
        return `${currentStep.workingNumber} − ${currentStep.quotientDigit * divisor} = ?`;
      }
      return `This remainder carries to the next digit.`;
    }
    
    return '';
  };

  // ─── Render ───
  // The bus stop visual proportions  
  const digitWidth = 'clamp(2.8rem, 8vw, 4rem)';
  const mainFontSize = 'clamp(2.5rem, 7vw, 4.5rem)';
  const carryFontSize = 'clamp(1.2rem, 3.5vw, 2rem)';
  const answerFontSize = 'clamp(2.2rem, 6.5vw, 3.8rem)';

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', flex: 1, 
      fontFamily: "'Fredoka One', cursive", width: '100%',
      minHeight: 0,
    }}>
      {/* ─── Bus Stop Visual ─── */}
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        minHeight: 0, overflow: 'hidden',
      }}>
        {/* Answer row (quotient digits above the bus stop) */}
        <div style={{ 
          display: 'flex', 
          marginLeft: `calc(${digitWidth} + 1rem)`,  // offset to align with digits under shelter
          marginBottom: '0.1rem',
          gap: '0',
        }}>
          {digits.map((_, i) => {
            const step = steps[i];
            const vis = getHelpVisibility(i);
            const isActiveQuotient = mode === 'interactive' && activeStepIndex === i && subPhase === 'quotient' && !isComplete;
            const hasValue = quotientValues[i] !== undefined;
            const showInHelp = vis.showQuotient && !step.isLeadingZero;
            const showValue = (mode === 'help' && showInHelp) || hasValue;
            const isShaking = shakeTarget === `q-${i}`;

            // Don't show anything for leading zeros
            if (step.isLeadingZero && mode === 'help' && !vis.isActive) return (
              <div key={i} style={{ width: digitWidth, height: answerFontSize }} />
            );
            
            return (
              <motion.div 
                key={i}
                animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                style={{ 
                  width: digitWidth, 
                  height: 'clamp(2.5rem, 7vw, 4rem)',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'flex-end',
                  fontSize: answerFontSize,
                  color: 'var(--success)',
                }}
              >
                {showValue ? (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: 'var(--success)', textShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}
                  >
                    {mode === 'help' ? step.quotientDigit : quotientValues[i]}
                  </motion.span>
                ) : isActiveQuotient ? (
                  <div 
                    className="animate-pulse-ring" 
                    style={{ 
                      width: 'clamp(2.2rem, 6vw, 3.2rem)', 
                      height: 'clamp(2.5rem, 6.5vw, 3.5rem)',
                      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--success)',
                      border: '2px dashed var(--success)', 
                      borderRadius: '8px',
                    }}
                  >
                    ?
                  </div>
                ) : null}
              </motion.div>
            );
          })}
          
          {/* Final remainder display */}
          {(finalRemainder > 0) && (
            <div style={{ 
              display: 'flex', alignItems: 'flex-end', 
              marginLeft: '0.3rem',
              fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)',
              color: 'var(--warning)',
              gap: '0.15rem',
            }}>
              {(() => {
                const showFinalR = (mode === 'help' && helpStep > steps.length) || 
                                   (mode === 'interactive' && isComplete) ||
                                   (mode === 'interactive' && activeStepIndex === steps.length - 1 && subPhase === 'remainder');
                const hasFinalRValue = finalRemainderValue !== '' || (mode === 'help' && helpStep > steps.length);

                if (!showFinalR) return null;
                
                return (
                  <>
                    <span style={{ fontSize: '0.8em' }}>r</span>
                    {hasFinalRValue ? (
                      <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        style={{ fontWeight: 800 }}
                      >
                        {mode === 'help' ? finalRemainder : finalRemainderValue}
                      </motion.span>
                    ) : (
                      <motion.div 
                        className="animate-pulse-ring"
                        animate={shakeTarget === 'final-r' ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                        style={{ 
                          width: 'clamp(2rem, 5.5vw, 3rem)', 
                          height: 'clamp(2rem, 5.5vw, 3rem)',
                          fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(245, 158, 11, 0.1)', 
                          color: 'var(--warning)',
                          border: '2px dashed var(--warning)', 
                          borderRadius: '8px',
                        }}
                      >
                        ?
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Bus stop frame: divisor + shelter */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Divisor (outside the shelter) */}
          <div style={{ 
            paddingRight: '0.6rem', 
            fontSize: mainFontSize,
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center',
            fontWeight: 800,
          }}>
            {divisor}
          </div>
          
          {/* The shelter (border-top + border-left + digits inside) */}
          <div style={{ 
            display: 'flex', 
            borderTop: '5px solid var(--text-primary)', 
            borderLeft: '5px solid var(--text-primary)', 
            padding: '0.4rem 0.6rem 0.4rem 0.3rem',
            borderTopLeftRadius: '14px',
          }}>
            {digits.map((digit, i) => {
              const step = steps[i];
              const vis = getHelpVisibility(i);
              const isActiveDigit = mode === 'interactive' && activeStepIndex === i && !isComplete;
              const showCarry = (mode === 'help' && vis.showRemainder && step.remainder > 0 && i < digits.length - 1) ||
                                (mode === 'interactive' && remainderValues[i] !== undefined);
              const isShakingR = shakeTarget === `r-${i}`;
              const isWaitingForRemainder = mode === 'interactive' && activeStepIndex === i && subPhase === 'remainder' && !isComplete && i < steps.length - 1 && remainderValues[i] === undefined;

              return (
                <div 
                  key={`digit-${i}`} 
                  style={{ 
                    width: digitWidth, 
                    position: 'relative', 
                    fontSize: mainFontSize,
                    textAlign: 'center',
                    fontWeight: 800,
                    color: isActiveDigit ? 'var(--text-primary)' : 'var(--text-primary)',
                    transition: 'color 0.3s',
                  }}
                >
                  {/* Carry indicator (shown as small number top-left of this digit) */}
                  {showCarry && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ 
                        position: 'absolute', 
                        top: '0.5rem', 
                        left: '-0.6rem', 
                        fontSize: carryFontSize,
                        color: 'var(--warning)',
                        fontWeight: 700,
                        zIndex: 5,
                        lineHeight: 1,
                      }}
                    >
                      {mode === 'help' ? step.remainder : remainderValues[i]}
                    </motion.span>
                  )}
                  
                  {/* Waiting-for-carry indicator */}
                  {isWaitingForRemainder && (
                    <motion.div
                      className="animate-pulse-ring"
                      animate={isShakingR ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: 'absolute',
                        top: '0.15rem',
                        left: '-1rem',
                        width: 'clamp(1.8rem, 5vw, 2.5rem)',
                        height: 'clamp(1.5rem, 4vw, 2.2rem)',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--warning)',
                        border: '2px dashed var(--warning)',
                        borderRadius: '4px',
                        zIndex: 10,
                      }}
                    >
                      r?
                    </motion.div>
                  )}

                  {/* Highlight ring for active digit */}
                  {(isActiveDigit || vis.isActive) && !isComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: 'absolute',
                        inset: '0.1rem -0.1rem',
                        border: '2px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* The digit itself */}
                  <span style={{ position: 'relative', zIndex: 2 }}>{digit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Guidance area ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingBottom: '0.5rem',
        }}
      >
        <div 
          className="title-font" 
          style={{ 
            fontSize: 'clamp(1.1rem, 2.5vh, 1.4rem)', 
            marginBottom: '0.3rem', 
            color: 'var(--primary)',
          }}
        >
          {getGuidanceTitle()}
        </div>
        <div style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '0.8rem', 
          lineHeight: 1.5, 
          maxWidth: '280px',
        }}>
          {getGuidanceSubtext()}
        </div>

        {/* Help mode navigation buttons */}
        {mode === 'help' && (
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            {helpStep > 0 && (
              <button 
                onClick={() => setHelpStep(prev => prev - 1)}
                className="btn-primary" 
                style={{ 
                  padding: '0.6rem 1rem', fontSize: '1rem', 
                  display: 'flex', alignItems: 'center', gap: '0.4rem', 
                  borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', 
                  boxShadow: 'none', minWidth: '120px', justifyContent: 'center',
                }}
              >
                ‹ Back
              </button>
            )}
            <button 
              onClick={() => {
                if (helpStep < totalHelpSteps) {
                  setHelpStep(prev => prev + 1);
                } else {
                  onComplete();
                }
              }}
              className="btn-primary" 
              style={{ 
                padding: '0.6rem 1rem', fontSize: '1rem', 
                display: 'flex', alignItems: 'center', gap: '0.4rem', 
                borderRadius: '2rem', minWidth: '120px', justifyContent: 'center',
              }}
            >
              {helpStep < totalHelpSteps ? 'Next ›' : 'Got it! ›'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
