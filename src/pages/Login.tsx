import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import type { User } from '../store';
import { Plus, X, Pencil } from 'lucide-react';

export default function Login() {
  const { users, login, addUser, editUser, deleteUser } = useAppContext();
  const navigate = useNavigate();
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');

  const handleLogin = (id: string) => {
    login(id);
    navigate('/');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && typeof newAge === 'number') {
      const avatars = ['👦🏻', '👦🏼', '👦🏽', '👧🏻', '👧🏼', '👧🏽', '🤖', '👾', '👽', '🦖', '🦄', '🐶', '🦊', '🚀'];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      addUser(newName.trim(), newAge, randomAvatar);
      setShowAdd(false);
      setNewName('');
      setNewAge('');
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && newName.trim() && typeof newAge === 'number') {
      editUser(editingUser.id, newName.trim(), newAge, editingUser.avatar);
      setEditingUser(null);
      setNewName('');
      setNewAge('');
    }
  };
  
  const handleDelete = () => {
    if (editingUser) {
      if (confirm(`Are you sure you want to delete ${editingUser.name}?`)) {
        deleteUser(editingUser.id);
        setEditingUser(null);
        setNewName('');
        setNewAge('');
      }
    }
  };

  const openEdit = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setEditingUser(user);
    setNewName(user.name);
    setNewAge(user.age || '');
  };

  const openAdd = () => {
    setEditingUser(null);
    setNewName('');
    setNewAge('');
    setShowAdd(true);
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <h1 className="title-font gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Brain Quest!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Who is ready to play?</p>
      </motion.div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          maxWidth: '800px', 
          width: '100%',
          padding: '0 1rem'
        }}
      >
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{ position: 'relative', display: 'flex' }}
          >
            <motion.button
              onClick={() => handleLogin(user.id)}
              className="glass-panel"
              whileHover={{ scale: 1.05, border: '1px solid var(--primary)' }}
              style={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '1.2rem 1rem',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{user.avatar}</span>
              <h2 className="title-font" style={{ fontSize: '1.1rem', margin: 0 }}>{user.name}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                {user.age ? `Age: ${user.age}` : 'Select Player'}
              </span>
            </motion.button>
            <button
              onClick={(e) => openEdit(e, user)}
              style={{ 
                position: 'absolute', 
                top: '0.5rem', 
                right: '0.5rem', 
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '0.4rem', 
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <Pencil size={14} />
            </button>
          </motion.div>
        ))}

        {/* Add User Button */}
        <motion.button
          onClick={openAdd}
          className="glass-panel"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: users.length * 0.1 }}
          whileHover={{ scale: 1.05, border: '1px dashed var(--primary)' }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1.2rem 1rem',
            gap: '0.5rem',
            cursor: 'pointer',
            background: 'transparent',
            border: '2px dashed var(--glass-border)'
          }}
        >
          <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '50%' }}>
            <Plus size={32} color="var(--primary)" />
          </div>
          <h2 className="title-font" style={{ fontSize: '1.1rem', margin: 0 }}>New Player</h2>
        </motion.button>
      </div>

      {/* Shared Modal for Add/Edit */}
      <AnimatePresence>
        {(showAdd || editingUser) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)',
              zIndex: 100,
            }}
            onClick={() => { setShowAdd(false); setEditingUser(null); }}
          >
            <motion.div
              className="glass-panel"
              style={{ padding: '3rem', width: '90%', maxWidth: '400px', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { setShowAdd(false); setEditingUser(null); }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
              >
                <X size={24} />
              </button>

              <h2 className="title-font" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                {editingUser ? 'Edit Player' : 'Add New Player'}
              </h2>
              
              <form onSubmit={editingUser ? handleEdit : handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>Player Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Charlie"
                    style={{
                      width: '100%', padding: '0.8rem', borderRadius: '0.5rem',
                      border: '1px solid var(--glass-border)', background: 'var(--bg-card)',
                      color: 'var(--text)', fontSize: '1.1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>Age</label>
                  <input 
                    type="number" 
                    required
                    min={3}
                    max={99}
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="e.g. 7"
                    style={{
                      width: '100%', padding: '0.8rem', borderRadius: '0.5rem',
                      border: '1px solid var(--glass-border)', background: 'var(--bg-card)',
                      color: 'var(--text)', fontSize: '1.1rem'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                  {editingUser ? 'Save Changes' : 'Create Player'}
                </button>
                
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="danger-button"
                    style={{ 
                      marginTop: '0.5rem', 
                      padding: '1rem', 
                      fontSize: '1rem', 
                      fontWeight: 'bold', 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)'
                    }}
                  >
                    Delete Player
                  </button>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Number */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', zIndex: 10 }}>
        v1.0.1
      </div>
    </div>
  );
}
