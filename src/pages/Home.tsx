import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, Type } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="title-font gradient-text" style={{ fontSize: '2.5rem' }}>Choose Your Quest!</h1>
      </motion.div>

      <div className="grid-2" style={{ gap: '1rem', width: '100%', maxWidth: '900px' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/math')}
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(145deg, var(--surface), var(--bg-color))', border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', width: '60px', height: '60px', margin: '0 auto 1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Calculator size={32} color="var(--primary)" />
          </div>
          <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Math Magic</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Practice addition, subtraction, multiplication, and more!</p>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/spelling')}
          style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(145deg, var(--surface), var(--bg-color))', border: '1px solid rgba(139, 92, 246, 0.2)' }}
        >
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', width: '60px', height: '60px', margin: '0 auto 1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Type size={32} color="var(--purple)" />
          </div>
          <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--purple)' }}>Word Wizard</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Level up your spelling skills with fun challenges!</p>
        </motion.div>
      </div>
    </div>
  );
}
