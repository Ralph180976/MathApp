import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { LongMultiplication } from './LongMultiplication';

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

export const MultiplicationHelp: React.FC<Props> = ({ question, helpStep, setHelpStep, resetHelp, isInteractive, onInput, onComplete }) => {
  const isShort = question.num2 < 10;
  
  if (isShort) {
    return <ShortMultiplication question={question} helpStep={helpStep} setHelpStep={setHelpStep} resetHelp={resetHelp} />;
  } else {
    return <LongMultiplication question={question} helpStep={helpStep} setHelpStep={setHelpStep} resetHelp={resetHelp} isInteractive={isInteractive} onInput={onInput} onComplete={onComplete} />;
  }
};

const ShortMultiplication: React.FC<Props> = ({ question, helpStep, setHelpStep, resetHelp }) => {
  const [subStep, setSubStep] = React.useState<0 | 1>(0);

  React.useEffect(() => {
    setSubStep(0);
  }, [helpStep]);

  const topDigits = question.num1.toString().split('');
  const bottomDigit = question.num2;
  const numSteps = topDigits.length;
  
  // Calculate states for each step
  const steps: { d1: number; d2: number; product: number; carryIn: number; writeDigit: number; carryOut: number }[] = [];
  let carry = 0;
  for (let i = topDigits.length - 1; i >= 0; i--) {
    const d1 = parseInt(topDigits[i]);
    const p = d1 * bottomDigit;
    const total = p + carry;
    steps.push({
      d1,
      d2: bottomDigit,
      product: p,
      carryIn: carry,
      writeDigit: total % 10,
      carryOut: Math.floor(total / 10)
    });
    carry = Math.floor(total / 10);
  }
  
  const totalSteps = numSteps + 1; // 0 = start, 1..n = columns
  
  const currentStepData = helpStep >= 1 && helpStep <= numSteps ? steps[helpStep - 1] : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>
      {/* Auto-Scaling Math Stack Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '240px', alignItems: 'flex-end', marginTop: '1.5rem', transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        
        <div style={{ fontSize: 'clamp(2.5rem, 6vh, 3.5rem)', fontWeight: 800, fontFamily: "'Fredoka One', cursive", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1', marginBottom: '1rem', width: '100%' }}>
          
          {/* Top Number */}
          <div style={{ paddingRight: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            {topDigits.map((d, i) => {
              const stepForDigit = topDigits.length - i;
              const isActive = helpStep === stepForDigit;
              return (
                <span key={i} style={{ color: isActive ? 'var(--success)' : 'inherit', transition: 'color 0.3s' }}>{d}</span>
              );
            })}
          </div>

          {/* Bottom Number */}
          <div style={{ display: 'flex', borderBottom: '6px solid var(--text-primary)', paddingBottom: '0.3rem', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--primary)', paddingRight: '1rem', alignSelf: 'flex-end' }}>×</span>
            <div style={{ paddingRight: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ color: helpStep >= 1 && helpStep <= numSteps ? 'var(--success)' : 'inherit', transition: 'color 0.3s' }}>
                {bottomDigit}
              </span>
            </div>
          </div>

        </div>

        {/* Answer Box */}
        <div style={{ 
          width: '100%', fontSize: 'clamp(2.5rem, 6vh, 3.5rem)', fontWeight: 800, fontFamily: "'Fredoka One', cursive", 
          textAlign: 'right', padding: '0 0.5rem 0 0', height: 'clamp(3.5rem, 8vh, 4rem)', borderRadius: '0.75rem', 
          background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          color: helpStep >= totalSteps ? 'var(--success-dark)' : 'inherit'
        }}>
          {helpStep >= totalSteps ? (
            <span style={{ color: 'var(--success-dark)' }}>{question.answer}</span>
          ) : (
            <div style={{ display: 'flex' }}>
              {question.answer.toString().split('').map((d, i, arr) => {
                const idxFromRight = arr.length - 1 - i;
                const colStep = idxFromRight + 1;
                const isStepFinished = !currentStepData || currentStepData.carryIn === 0 || subStep === 1;
                const activeThisStep = helpStep === colStep || (colStep > numSteps && helpStep >= numSteps);
                const revealed = helpStep > colStep || (activeThisStep && isStepFinished);
                
                let displayColor = 'var(--text-primary)';
                let intermediateChar: string | null = null;
                
                if (revealed) {
                    displayColor = 'var(--success-dark)';
                } 
                
                if (activeThisStep && currentStepData) {
                    intermediateChar = currentStepData.product.toString().slice(-1);
                }

                return (
                  <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '1ch', transition: 'all 0.3s', color: displayColor }}>
                    <span style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.3s' }}>
                      {d}
                    </span>
                    {intermediateChar && (
                       <div style={{ 
                         position: 'absolute', bottom: '-1.8rem', left: '0', width: '100%', display: 'flex', justifyContent: 'center',
                         fontSize: '1.2rem', color: 'var(--success)', opacity: 1,
                         transition: 'all 0.3s'
                       }}>
                         {intermediateChar}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Carries */}
        {helpStep >= 1 && helpStep <= numSteps && (
          <div style={{ paddingRight: '0.5rem', display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
            {question.answer.toString().split('').map((_, i, arr) => {
              const idxFromRight = arr.length - 1 - i;
              const colStep = idxFromRight + 1;
              const isStepFinished = !currentStepData || currentStepData.carryIn === 0 || subStep === 1;
              const isCurrentCarry = currentStepData?.carryOut !== undefined && currentStepData.carryOut > 0 && colStep === helpStep + 1 && isStepFinished;
              const isPrevCarry = helpStep >= 2 && steps[helpStep - 2].carryOut > 0 && colStep === helpStep;
              const showCarry = (isCurrentCarry || isPrevCarry) && colStep <= numSteps;
              const carryVal = isCurrentCarry ? currentStepData.carryOut : (isPrevCarry ? steps[helpStep - 2].carryOut : 0);
              
              return (
                <span key={i} style={{ 
                  fontSize: 'clamp(2.5rem, 6vh, 3.5rem)', fontWeight: 800, fontFamily: "'Fredoka One', cursive",
                  textAlign: 'center', width: '1ch', display: 'flex', justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '0.6em',
                    visibility: showCarry ? 'visible' : 'hidden',
                    color: isCurrentCarry ? 'var(--pink)' : 'rgba(236, 72, 153, 0.4)', transition: 'color 0.3s',
                  }}>
                    {showCarry ? carryVal : '0'}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanatory Text */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="title-font" style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
          {helpStep === 0 && "Let's solve it!"}
          {helpStep >= 1 && helpStep <= numSteps && currentStepData && (() => {
            const basePval = Math.pow(10, helpStep - 1);
            const actualD1 = currentStepData.d1 * basePval;
            const actualD2 = currentStepData.d2;
            const actualP = actualD1 * actualD2;
            const actualCarryIn = currentStepData.carryIn * basePval;
            const finalP = actualP + actualCarryIn;
            
            const renderFinalVal = (carryOut: number, writeDigit: number) => {
              if (carryOut > 0) {
                 return (
                   <>
                     <span style={{ color: 'var(--pink)' }}>{carryOut}</span>
                     <span style={{ color: 'var(--success-dark)' }}>{writeDigit}{basePval > 1 ? '0'.repeat(helpStep - 1) : ''}</span>
                   </>
                 );
              }
              return <span style={{ color: 'var(--success-dark)' }}>{finalP}</span>;
            };

            return (
              <span style={{ color: 'var(--success)' }}>
                {actualD1} <span style={{ color: 'var(--primary)' }}>×</span> {actualD2} <span style={{ color: 'var(--primary)' }}>=</span> {actualP}
                {currentStepData.carryIn > 0 && subStep === 1 && (
                  <>
                    <br />
                    <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '1.2rem', display: 'inline-block', marginTop: '0.2rem' }}>
                      {actualP} <span style={{ color: 'var(--primary)' }}>+</span> <span style={{ color: 'var(--pink)' }}>{actualCarryIn}</span> (carry) <span style={{ color: 'var(--primary)' }}>=</span> {renderFinalVal(currentStepData.carryOut, currentStepData.writeDigit)}
                    </motion.span>
                  </>
                )}
                {currentStepData.carryIn === 0 && (
                  <>
                    {' '}<span style={{ color: 'var(--primary)' }}>→</span> {renderFinalVal(currentStepData.carryOut, currentStepData.writeDigit)}
                  </>
                )}
              </span>
            );
          })()}
          {helpStep >= totalSteps && <span style={{ color: 'var(--success-dark)' }}>Answer: {question.answer}</span>}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5, maxWidth: '260px', textAlign: 'center' }}>
          {helpStep === 0 && "Start by multiplying the ones."}
          {helpStep >= 1 && helpStep < numSteps && currentStepData && currentStepData.carryOut > 0 && <>Carry the <strong style={{ color: 'var(--pink)' }}>{currentStepData.carryOut}</strong> to the next column.</>}
          {helpStep >= totalSteps && "All done!"}
        </div>
      </motion.div>
      </div>
      
      {/* Static Footer (Buttons stay locked here) */}
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', padding: '0.8rem 0 0.5rem', background: 'var(--surface)', zIndex: 10, width: '100%' }}>
        {(helpStep > 1 || subStep > 0) && (
          <button onClick={() => { 
              if (subStep > 0) {
                setSubStep(0);
              } else {
                setHelpStep(Math.max(0, helpStep - 1));
                setSubStep(0); // If we go back a step, definitely clear subStep
              }
            }} className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none', minWidth: '120px', justifyContent: 'center' }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <button onClick={() => { 
            if (currentStepData && currentStepData.carryIn > 0 && subStep === 0) {
              setSubStep(1);
            } else {
              if (helpStep < totalSteps) setHelpStep(helpStep + 1); 
              else resetHelp(); 
            }
          }} className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '2rem', minWidth: '120px', justifyContent: 'center' }}>
          {helpStep < totalSteps || (currentStepData && currentStepData.carryIn > 0 && subStep === 0) ? 'Next' : 'Got it!'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
