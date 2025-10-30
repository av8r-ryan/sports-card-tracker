import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ParticleBackground from '../Animation/ParticleBackground';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import './AuthForm.css';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const { state, login, register, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (state.error) {
      clearError();
    }
    if (passwordMismatch) {
      setPasswordMismatch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const isFormValid = () => {
    if (mode === 'login') {
      return formData.email && formData.password;
    } else {
      return (
        formData.username &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword &&
        !passwordMismatch
      );
    }
  };

  return (
    <ParticleBackground 
      particleCount={60}
      colors={['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']}
      speed={0.5}
      className="auth-container"
    >
      <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.2}>
        <div className="auth-card card-glass">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-gradient">Collectors Playbook</h1>
            <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="auth-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={state.loading}
                  placeholder="Enter your username"
                  className="focus-ring"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={state.loading}
              placeholder="Enter your email"
              className="focus-ring"
            />
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={state.loading}
              placeholder="Enter your password"
              minLength={6}
              className="focus-ring"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={state.loading}
                  placeholder="Confirm your password"
                  minLength={6}
                  className="focus-ring"
                />
                <AnimatePresence>
                  {(passwordMismatch || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)) && (
                    <motion.div 
                      className="field-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      Passwords do not match
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {state.error && (
            <div className="auth-error">
              {state.error}
            </div>
          )}

          <motion.button
            type="submit"
            className="auth-submit btn-primary hover-lift"
            disabled={state.loading || !isFormValid()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {state.loading ? (
              <div className="auth-loading">
                <div className="loading-spinner"></div>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          className="auth-toggle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <motion.button 
                type="button" 
                onClick={onToggleMode} 
                className="toggle-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up
              </motion.button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <motion.button 
                type="button" 
                onClick={onToggleMode} 
                className="toggle-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            </p>
          )}
        </motion.div>
        </div>
      </AnimatedWrapper>
    </ParticleBackground>
  );
};

export default AuthForm;