import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/DexieCardContext';
import { logError } from '../../utils/logger';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import './NotFound.css';

interface NotFoundProps {
  onNavigateHome?: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome }) => {
  const { state: authState } = useAuth();
  const { state: cardState } = useCards();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [clickedCards, setClickedCards] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    logError('NotFound', '404 page accessed');
  }, []);

  // Search functionality
  const searchCards = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const results = cardState.cards
        .filter(
          (card) =>
            card.player?.toLowerCase().includes(query.toLowerCase()) ||
            card.team?.toLowerCase().includes(query.toLowerCase()) ||
            card.brand?.toLowerCase().includes(query.toLowerCase()) ||
            card.year?.toString().includes(query)
        )
        .slice(0, 5);

      setTimeout(() => {
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    },
    [cardState.cards]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCards(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCards]);

  // Fun interactive game
  const floatingCards = useMemo(
    () => [
      { id: '1', emoji: '🃏', points: 10 },
      { id: '2', emoji: '⚾', points: 5 },
      { id: '3', emoji: '🏀', points: 8 },
      { id: '4', emoji: '🏈', points: 7 },
      { id: '5', emoji: '⚽', points: 6 },
      { id: '6', emoji: '🏒', points: 9 },
    ],
    []
  );

  const handleCardClick = useCallback(
    (cardId: string, points: number) => {
      if (clickedCards.has(cardId)) return;

      setClickedCards((prev) => new Set([...prev, cardId]));
      setGameScore((prev) => prev + points);
      setGameActive(true);

      setTimeout(() => {
        setGameActive(false);
      }, 1000);
    },
    [clickedCards]
  );

  const resetGame = useCallback(() => {
    setGameScore(0);
    setClickedCards(new Set());
  }, []);

  const handleGoHome = () => {
    logError('NotFound', 'User clicked go home button');
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    logError('NotFound', 'User clicked go back button');
    window.history.back();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to inventory with search
      window.location.href = `/#inventory?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-background">
        {floatingCards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`floating-card floating-card-${index + 1} ${clickedCards.has(card.id) ? 'clicked' : ''}`}
            onClick={() => handleCardClick(card.id, card.points)}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              delay: index * 0.5,
            }}
            onHoverStart={() => setHoveredCard(card.id)}
            onHoverEnd={() => setHoveredCard(null)}
          >
            {card.emoji}
            {hoveredCard === card.id && (
              <motion.div
                className="card-tooltip"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                +{card.points} points
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="not-found-content">
        <AnimatedWrapper animation="fadeInDown" duration={0.8}>
          <div className="error-code">
            <motion.span
              className="error-number"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              4
            </motion.span>
            <motion.span
              className="error-card"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🃏
            </motion.span>
            <motion.span
              className="error-number"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              4
            </motion.span>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.2}>
          <h1 className="not-found-title">Card Not Found</h1>
          <p className="not-found-subtitle">
            Looks like this page got traded away! The card you're looking for doesn't exist in our collection.
          </p>
        </AnimatedWrapper>

        {/* Interactive Search */}
        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.4}>
          <div className="search-section">
            <motion.button
              className="search-toggle-btn"
              onClick={() => setShowSearch(!showSearch)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="search-icon">🔍</span>
              Search Your Collection
            </motion.button>

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  className="search-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="search-input-container">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by player, team, sport, or year..."
                        className="search-input"
                      />
                      {isSearching && (
                        <div className="search-spinner">
                          <div className="spinner" />
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          className="search-results"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {searchResults.map((card, index) => (
                            <motion.div
                              key={card.id}
                              className="search-result-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => (window.location.href = `/#inventory?card=${card.id}`)}
                            >
                              <span className="result-icon">🃏</span>
                              <div className="result-info">
                                <div className="result-title">{card.player}</div>
                                <div className="result-subtitle">
                                  {card.team} • {card.year}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedWrapper>

        {/* Interactive Game Score */}
        <AnimatePresence>
          {gameActive && (
            <motion.div
              className="game-score-popup"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              +{gameScore} points!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.6}>
          <div className="not-found-actions">
            <motion.button
              className="not-found-btn primary"
              onClick={handleGoHome}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">🏠</span>
              Go Home
            </motion.button>

            <motion.button
              className="not-found-btn secondary"
              onClick={handleGoBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">⬅️</span>
              Go Back
            </motion.button>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.8}>
          <div className="not-found-suggestions">
            <h3>Popular Collections</h3>
            <div className="suggestion-cards">
              {[
                { icon: '📦', label: 'My Collection', href: '/#inventory' },
                { icon: '📊', label: 'Dashboard', href: '/#dashboard' },
                { icon: '📈', label: 'Reports', href: '/#reports' },
                { icon: '🏆', label: 'eBay Listings', href: '/#ebay' },
                { icon: '📚', label: 'Collections', href: '/#collections' },
                ...(authState.user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Panel', href: '/#admin' }] : []),
              ].map((suggestion, index) => (
                <motion.div
                  key={suggestion.label}
                  className="suggestion-card"
                  onClick={() => (window.location.href = suggestion.href)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span>{suggestion.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedWrapper>

        {/* Fun Interactive Game Section */}
        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={1.0}>
          <div className="interactive-game">
            <h3>Card Collector Game</h3>
            <p>Click the floating cards to collect points!</p>
            <div className="game-stats">
              <div className="game-score">
                <span className="score-label">Score:</span>
                <span className="score-value">{gameScore}</span>
              </div>
              <motion.button
                className="reset-game-btn"
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset Game
              </motion.button>
            </div>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={1.2}>
          <div className="not-found-help">
            <p>
              Still can't find what you're looking for?
              <a href="mailto:sookie@zylt.ai" className="help-link">
                Contact Support
              </a>
            </p>
          </div>
        </AnimatedWrapper>
      </div>
    </div>
  );
};

export default NotFound;
