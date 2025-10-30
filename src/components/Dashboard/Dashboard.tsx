import { motion } from 'framer-motion';
import React, { useMemo, useState, useCallback } from 'react';

import { useCards } from '../../context/DexieCardContext';
import { logInfo, logDebug } from '../../utils/logger';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import Carousel, { CarouselItem } from '../Carousel/Carousel';
import Modal from '../Modal/Modal';
import './Dashboard.css';

const Dashboard: React.FC = React.memo(() => {
  const { state, getPortfolioStats } = useCards();
  const stats = getPortfolioStats();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'recent' | 'top' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatCurrency = (amount: number) => {
    // For very large numbers, use compact notation
    if (Math.abs(amount) >= 1000000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    }

    // For medium numbers, show thousands with K
    if (Math.abs(amount) >= 10000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 0,
      }).format(amount);
    }

    // For smaller numbers, use standard notation
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recentCards = useMemo(() => {
    console.log('Dashboard recentCards - state.cards:', state.cards);
    console.log('First card images in dashboard:', state.cards[0]?.images);
    return [...state.cards]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [state.cards]);

  const topPerformers = useMemo(() => {
    return [...state.cards]
      .map((card) => ({
        ...card,
        profit: card.currentValue - card.purchasePrice,
        profitPercent: ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100,
      }))
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, 5);
  }, [state.cards]);

  // Convert cards to carousel items
  const recentCardsCarousel: CarouselItem[] = useMemo(() => {
    return recentCards.map((card) => ({
      id: card.id,
      title: `${card.year} ${card.brand} ${card.player}`,
      description: `${card.team} - #${card.cardNumber}`,
      value: formatCurrency(card.currentValue),
      category: 'Recent Addition',
      image: card.images && card.images.length > 0 ? card.images[0] : undefined,
      icon: card.images && card.images.length > 0 ? undefined : '🆕',
    }));
  }, [recentCards]);

  const topPerformersCarousel: CarouselItem[] = useMemo(() => {
    return topPerformers.map((card) => ({
      id: card.id,
      title: `${card.year} ${card.brand} ${card.player}`,
      description: `${card.team} - #${card.cardNumber}`,
      value: `${formatCurrency(card.profit)} (${card.profitPercent > 0 ? '+' : ''}${card.profitPercent.toFixed(1)}%)`,
      category: 'Top Performer',
      image: card.images && card.images.length > 0 ? card.images[0] : undefined,
      icon: card.images && card.images.length > 0 ? undefined : card.profit >= 0 ? '📈' : '📉',
    }));
  }, [topPerformers]);

  const handleCardClick = useCallback(
    (item: CarouselItem) => {
      logInfo('Dashboard', 'Card clicked in carousel', { cardId: item.id, title: item.title });

      // Find the original card data and determine type
      const recentCard = recentCards.find((c) => c.id === item.id);
      const topCard = topPerformers.find((c) => c.id === item.id);

      if (recentCard) {
        setSelectedCard(recentCard);
        setModalType('recent');
        const index = recentCards.findIndex((c) => c.id === item.id);
        setCurrentIndex(index);
      } else if (topCard) {
        setSelectedCard(topCard);
        setModalType('top');
        const index = topPerformers.findIndex((c) => c.id === item.id);
        setCurrentIndex(index);
      }

      setIsModalOpen(true);
    },
    [recentCards, topPerformers]
  );

  const handleModalClose = useCallback(() => {
    logDebug('Dashboard', 'Modal closed');
    setIsModalOpen(false);
    setSelectedCard(null);
    setModalType(null);
  }, []);

  const handlePrevious = () => {
    if (modalType) {
      const cards = modalType === 'recent' ? recentCards : topPerformers;
      const newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      setCurrentIndex(newIndex);
      setSelectedCard(cards[newIndex]);
      logDebug('Dashboard', 'Modal navigation - previous', { newIndex });
    }
  };

  const handleNext = () => {
    if (modalType) {
      const cards = modalType === 'recent' ? recentCards : topPerformers;
      const newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      setSelectedCard(cards[newIndex]);
      logDebug('Dashboard', 'Modal navigation - next', { newIndex });
    }
  };

  return (
    <div className="dashboard">
      <AnimatedWrapper animation="fadeInDown" duration={0.8}>
        <motion.h1
          className="text-gradient"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Portfolio Dashboard
        </motion.h1>
      </AnimatedWrapper>

      <motion.div
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="stats-grid">
          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.3}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Total Cards</h3>
              <p className="stat-value animate-pulse">{stats.totalCards}</p>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.4}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Total Investment</h3>
              <p className="stat-value animate-pulse">{formatCurrency(stats.totalCostBasis)}</p>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.5}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Current Value</h3>
              <p className="stat-value animate-pulse">{formatCurrency(stats.totalCurrentValue)}</p>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.6}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Total P&L</h3>
              <p className={`stat-value animate-pulse ${stats.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(stats.totalProfit)}
              </p>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.7}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Cards Sold</h3>
              <p className="stat-value animate-pulse">{stats.totalSold}</p>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.4} delay={0.8}>
            <motion.div
              className="stat-card card-glass hover-lift"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3>Sales Revenue</h3>
              <p className="stat-value animate-pulse">{formatCurrency(stats.totalSoldValue)}</p>
            </motion.div>
          </AnimatedWrapper>
        </div>
      </motion.div>

      <motion.div
        className="dashboard-sections"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <AnimatedWrapper animation="fadeInLeft" duration={0.6} delay={1.0}>
          <div className="recent-cards">
            <motion.h2
              className="text-gradient"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.1 }}
            >
              Recent Additions
            </motion.h2>
            {recentCards.length > 0 ? (
              <Carousel
                items={recentCardsCarousel}
                autoScroll={true}
                scrollInterval={4000}
                pauseOnHover={true}
                showNavigation={true}
                showDots={true}
                itemsPerView={3}
                onItemClick={handleCardClick}
              />
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1.2 }}>
                No cards added yet.
              </motion.p>
            )}
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper animation="fadeInRight" duration={0.6} delay={1.1}>
          <div className="top-performers">
            <motion.h2
              className="text-gradient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              Top Performers
            </motion.h2>
            {topPerformers.length > 0 ? (
              <Carousel
                items={topPerformersCarousel}
                autoScroll={true}
                scrollInterval={4000}
                pauseOnHover={true}
                showNavigation={true}
                showDots={true}
                itemsPerView={3}
                onItemClick={handleCardClick}
              />
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1.3 }}>
                No performance data available yet.
              </motion.p>
            )}
          </div>
        </AnimatedWrapper>
      </motion.div>

      {/* Card Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title=""
        showCloseButton={true}
        closeOnOverlayClick={true}
        closeOnEscape={true}
        size="medium"
        showNavigation={true}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={true}
        hasNext={true}
        currentIndex={currentIndex}
        totalItems={modalType === 'recent' ? recentCards.length : topPerformers.length}
      >
        {selectedCard && (
          <div className="card-detail-modal">
            <div className="card-detail-header">
              <div className="card-detail-image">
                <img
                  src={selectedCard.images && selectedCard.images.length > 0 ? selectedCard.images[0] : '/generic.png'}
                  alt={`${selectedCard.player} card`}
                />
              </div>
              <div className="card-detail-info">
                <h3>
                  {selectedCard.year} {selectedCard.brand} {selectedCard.player}
                </h3>
                <p className="card-detail-team">
                  {selectedCard.team} - #{selectedCard.cardNumber}
                </p>
                <div className="card-detail-values">
                  <div className="value-item">
                    <span className="value-label">Current Value:</span>
                    <span className="value-amount">{formatCurrency(selectedCard.currentValue)}</span>
                  </div>
                  <div className="value-item">
                    <span className="value-label">Purchase Price:</span>
                    <span className="value-amount">{formatCurrency(selectedCard.purchasePrice)}</span>
                  </div>
                  {modalType === 'top' && (
                    <>
                      <div className="value-item">
                        <span className="value-label">Profit/Loss:</span>
                        <span className={`value-amount ${selectedCard.profit >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(selectedCard.profit)}
                        </span>
                      </div>
                      <div className="value-item">
                        <span className="value-label">ROI:</span>
                        <span className={`value-amount ${selectedCard.profitPercent >= 0 ? 'positive' : 'negative'}`}>
                          {selectedCard.profitPercent > 0 ? '+' : ''}
                          {selectedCard.profitPercent.toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedCard.notes && (
              <div className="card-detail-notes">
                <h4>Notes</h4>
                <p>{selectedCard.notes}</p>
              </div>
            )}

            <div className="card-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Added:</span>
                <span className="meta-value">
                  {selectedCard.createdAt ? new Date(selectedCard.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              {selectedCard.grade && (
                <div className="meta-item">
                  <span className="meta-label">Grade:</span>
                  <span className="meta-value">{selectedCard.grade}</span>
                </div>
              )}
              {selectedCard.condition && (
                <div className="meta-item">
                  <span className="meta-label">Condition:</span>
                  <span className="meta-value">{selectedCard.condition}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
