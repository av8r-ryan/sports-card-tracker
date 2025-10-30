import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { useCards } from '../../context/DexieCardContext';
import { Card, CardFormData, CONDITIONS, CATEGORIES, GRADING_COMPANIES } from '../../types';
import { logDebug, logInfo, logWarn, logError } from '../../utils/logger';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import ImageUpload from '../ImageUpload/ImageUpload';
import './CardForm.css';

interface CardFormProps {
  card?: Card;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSuccess, onCancel }) => {
  const { addCard, updateCard } = useCards();
  const isEditing = !!card;
  const [images, setImages] = useState<string[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CardFormData>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Player and team information' },
    { id: 2, title: 'Card Details', description: 'Year, brand, and card specifics' },
    { id: 3, title: 'Condition & Value', description: 'Grading and pricing information' },
    { id: 4, title: 'Images & Notes', description: 'Photos and additional details' },
  ];

  logDebug('CardForm', 'Component initialized', { isEditing, cardId: card?.id, currentStep });

  // Step navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      logDebug('CardForm', 'Moving to next step', { from: currentStep, to: currentStep + 1 });
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      logDebug('CardForm', 'Moving to previous step', { from: currentStep, to: currentStep - 1 });
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= steps.length) {
        setCurrentStep(step);
        logDebug('CardForm', 'Jumping to step', { to: step });
      }
    },
    [steps.length]
  );

  // Real-time validation
  const validateStep = useCallback((step: number, data: any) => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.player?.trim()) errors.player = 'Player name is required';
        if (!data.team?.trim()) errors.team = 'Team is required';
        break;
      case 2:
        if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
          errors.year = 'Please enter a valid year';
        }
        if (!data.brand?.trim()) errors.brand = 'Brand is required';
        break;
      case 3:
        if (!data.currentValue || data.currentValue <= 0) {
          errors.currentValue = 'Please enter a valid current value';
        }
        if (!data.purchasePrice || data.purchasePrice <= 0) {
          errors.purchasePrice = 'Please enter a valid purchase price';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CardFormData>({
    defaultValues: {
      player: '',
      team: '',
      year: new Date().getFullYear(),
      brand: '',
      category: '',
      cardNumber: '',
      parallel: '',
      condition: CONDITIONS[0],
      gradingCompany: '',
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      sellPrice: undefined,
      sellDate: '',
      currentValue: 0,
      notes: '',
      collectionId: '',
    },
  });

  const sellPrice = watch('sellPrice');
  const sellDate = watch('sellDate');

  // Load collections
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const { collectionsDatabase } = await import('../../db/collectionsDatabase');
        const userCollections = await collectionsDatabase.getUserCollections();
        setCollections(userCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
      }
    };
    loadCollections();
  }, []);

  const resetForm = useCallback(
    (cardData?: Card) => {
      logDebug('CardForm', 'resetForm called', { hasCardData: !!cardData, cardId: cardData?.id });

      if (cardData) {
        try {
          // Safely handle date conversion
          const purchaseDate =
            cardData.purchaseDate instanceof Date
              ? cardData.purchaseDate.toISOString().split('T')[0]
              : new Date(cardData.purchaseDate).toISOString().split('T')[0];

          const sellDate = cardData.sellDate
            ? cardData.sellDate instanceof Date
              ? cardData.sellDate.toISOString().split('T')[0]
              : new Date(cardData.sellDate).toISOString().split('T')[0]
            : '';

          logDebug('CardForm', 'Date conversion successful', { purchaseDate, sellDate });

          const formData = {
            player: cardData.player || '',
            team: cardData.team || '',
            year: cardData.year || new Date().getFullYear(),
            brand: cardData.brand || '',
            category: cardData.category || '',
            cardNumber: cardData.cardNumber || '',
            parallel: cardData.parallel || '',
            condition: cardData.condition || CONDITIONS[0],
            gradingCompany: cardData.gradingCompany || '',
            purchasePrice: cardData.purchasePrice || 0,
            purchaseDate: purchaseDate,
            sellPrice: cardData.sellPrice || undefined,
            sellDate: sellDate,
            currentValue: cardData.currentValue || 0,
            notes: cardData.notes || '',
            collectionId: cardData.collectionId || '',
          };

          reset(formData);
          setImages(cardData.images || []);
          logInfo('CardForm', 'Form reset with card data', formData);
        } catch (error) {
          logError('CardForm', 'Error processing card data', error as Error, cardData);
          // Fallback to default values if there's an error
          reset({
            player: '',
            team: '',
            year: new Date().getFullYear(),
            brand: '',
            category: '',
            cardNumber: '',
            parallel: '',
            condition: CONDITIONS[0],
            gradingCompany: '',
            purchasePrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            sellPrice: undefined,
            sellDate: '',
            currentValue: 0,
            notes: '',
            collectionId: '',
          });
          setImages([]);
        }
      } else {
        reset({
          player: '',
          team: '',
          year: new Date().getFullYear(),
          brand: '',
          category: '',
          cardNumber: '',
          parallel: '',
          condition: CONDITIONS[0],
          gradingCompany: '',
          purchasePrice: 0,
          purchaseDate: new Date().toISOString().split('T')[0],
          sellPrice: undefined,
          sellDate: '',
          currentValue: 0,
          notes: '',
          collectionId: '',
        });
        setImages([]);
      }
    },
    [reset]
  );

  useEffect(() => {
    resetForm(card);
  }, [card, resetForm]);

  useEffect(() => {
    if (sellPrice && !sellDate) {
      setValue('sellDate', new Date().toISOString().split('T')[0]);
    } else if (!sellPrice && sellDate) {
      setValue('sellDate', '');
    }
  }, [sellPrice, sellDate, setValue]);

  const onSubmit = async (data: CardFormData) => {
    logInfo('CardForm', 'Form submitted', data);

    try {
      // Validate required fields
      if (!data.player || !data.team || !data.brand || !data.category || !data.cardNumber) {
        const missingFields = [];
        if (!data.player) missingFields.push('player');
        if (!data.team) missingFields.push('team');
        if (!data.brand) missingFields.push('brand');
        if (!data.category) missingFields.push('category');
        if (!data.cardNumber) missingFields.push('cardNumber');

        logWarn('CardForm', 'Required fields missing', { missingFields });
        throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
      }

      // Safely parse numbers and dates
      const year = Number(data.year);
      const purchasePrice = Number(data.purchasePrice);
      const currentValue = Number(data.currentValue);
      const sellPrice = data.sellPrice ? Number(data.sellPrice) : undefined;

      if (isNaN(year) || isNaN(purchasePrice) || isNaN(currentValue)) {
        logWarn('CardForm', 'Invalid numeric values', { year, purchasePrice, currentValue });
        throw new Error('Invalid numeric values provided');
      }

      const purchaseDate = new Date(data.purchaseDate);
      const sellDate = data.sellDate ? new Date(data.sellDate) : undefined;

      if (isNaN(purchaseDate.getTime())) {
        logWarn('CardForm', 'Invalid purchase date', { purchaseDate: data.purchaseDate });
        throw new Error('Invalid purchase date');
      }

      if (sellDate && isNaN(sellDate.getTime())) {
        logWarn('CardForm', 'Invalid sell date', { sellDate: data.sellDate });
        throw new Error('Invalid sell date');
      }

      const cardData: Card = {
        id: card?.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: card?.userId || '', // Will be set by the database
        collectionId: data.collectionId || undefined, // Will use default if not specified
        player: data.player.trim(),
        team: data.team.trim(),
        year: year,
        brand: data.brand.trim(),
        category: data.category.trim(),
        cardNumber: data.cardNumber.trim(),
        parallel: data.parallel?.trim() || undefined,
        condition: data.condition,
        gradingCompany: data.gradingCompany?.trim() || undefined,
        purchasePrice: purchasePrice,
        purchaseDate: purchaseDate,
        sellPrice: sellPrice,
        sellDate: sellDate,
        currentValue: currentValue,
        images: Array.isArray(images) ? images : [],
        notes: data.notes?.trim() || '',
        createdAt: card?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      logDebug('CardForm', 'Card data prepared', cardData);

      if (isEditing && card) {
        logInfo('CardForm', 'Updating existing card', { id: cardData.id });
        await updateCard(cardData);
      } else {
        logInfo('CardForm', 'Adding new card', { player: cardData.player });
        await addCard(cardData);
      }

      logInfo('CardForm', 'Card operation successful', { isEditing, id: cardData.id });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      logError('CardForm', 'Error saving card', error as Error, data);
      alert(`Error saving card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="card-form-container">
      <div className="card-form card-glass">
        <AnimatedWrapper animation="fadeInUp" duration={0.6}>
          <div className="form-header">
            <h2 className="text-gradient">{isEditing ? 'Edit Card' : 'Add New Card'}</h2>
            <p>
              {isEditing
                ? 'Update the details of your sports card below'
                : 'Enter the details of your sports card to add it to your collection'}
            </p>
          </div>
        </AnimatedWrapper>

        {/* Step Progress Indicator */}
        <AnimatedWrapper animation="fadeInDown" duration={0.6} delay={0.2}>
          <div className="step-progress">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                onClick={() => goToStep(step.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="step-number">{currentStep > step.id ? '✓' : step.id}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedWrapper>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                className="form-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="step-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="player">Player Name *</label>
                    <input
                      id="player"
                      type="text"
                      {...register('player', { required: true })}
                      placeholder="Enter player name"
                      className={validationErrors.player ? 'error' : ''}
                      onChange={(e) => {
                        register('player').onChange(e);
                        validateStep(1, { ...watch(), player: e.target.value });
                      }}
                    />
                    {validationErrors.player && <span className="error-message">{validationErrors.player}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="team">Team *</label>
                    <input
                      id="team"
                      type="text"
                      {...register('team', { required: true })}
                      placeholder="Enter team name"
                      className={validationErrors.team ? 'error' : ''}
                      onChange={(e) => {
                        register('team').onChange(e);
                        validateStep(1, { ...watch(), team: e.target.value });
                      }}
                    />
                    {validationErrors.team && <span className="error-message">{validationErrors.team}</span>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Card Details */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                className="form-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="step-title">Card Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <input
                      id="year"
                      type="number"
                      {...register('year', { required: true, min: 1900, max: new Date().getFullYear() + 1 })}
                      placeholder="Enter year"
                      className={validationErrors.year ? 'error' : ''}
                      onChange={(e) => {
                        register('year').onChange(e);
                        validateStep(2, { ...watch(), year: parseInt(e.target.value) });
                      }}
                    />
                    {validationErrors.year && <span className="error-message">{validationErrors.year}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <input
                      id="brand"
                      type="text"
                      {...register('brand', { required: true })}
                      placeholder="Enter brand name"
                      className={validationErrors.brand ? 'error' : ''}
                      onChange={(e) => {
                        register('brand').onChange(e);
                        validateStep(2, { ...watch(), brand: e.target.value });
                      }}
                    />
                    {validationErrors.brand && <span className="error-message">{validationErrors.brand}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select id="category" {...register('category', { required: true })}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      id="cardNumber"
                      type="text"
                      {...register('cardNumber', { required: true })}
                      placeholder="Enter card number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="parallel">Parallel/Insert</label>
                    <input
                      id="parallel"
                      type="text"
                      {...register('parallel')}
                      placeholder="Enter parallel type (optional)"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Condition & Value */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                className="form-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="step-title">Condition & Value</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="condition">Condition</label>
                    <select id="condition" {...register('condition')}>
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gradingCompany">Grading Company</label>
                    <select id="gradingCompany" {...register('gradingCompany')}>
                      <option value="">Select grading company</option>
                      {GRADING_COMPANIES.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gradingCompany">Grading Company</label>
                    <input
                      id="gradingCompany"
                      type="text"
                      {...register('gradingCompany')}
                      placeholder="Enter grading company (e.g., PSA, BGS)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="purchasePrice">Purchase Price *</label>
                    <input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      {...register('purchasePrice', { required: true, min: 0 })}
                      placeholder="Enter purchase price"
                      className={validationErrors.purchasePrice ? 'error' : ''}
                      onChange={(e) => {
                        register('purchasePrice').onChange(e);
                        validateStep(3, { ...watch(), purchasePrice: parseFloat(e.target.value) });
                      }}
                    />
                    {validationErrors.purchasePrice && (
                      <span className="error-message">{validationErrors.purchasePrice}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentValue">Current Value *</label>
                    <input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      {...register('currentValue', { required: true, min: 0 })}
                      placeholder="Enter current value"
                      className={validationErrors.currentValue ? 'error' : ''}
                      onChange={(e) => {
                        register('currentValue').onChange(e);
                        validateStep(3, { ...watch(), currentValue: parseFloat(e.target.value) });
                      }}
                    />
                    {validationErrors.currentValue && (
                      <span className="error-message">{validationErrors.currentValue}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="purchaseDate">Purchase Date</label>
                    <input id="purchaseDate" type="date" {...register('purchaseDate')} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sellPrice">Sell Price</label>
                    <input
                      id="sellPrice"
                      type="number"
                      step="0.01"
                      {...register('sellPrice', { min: 0 })}
                      placeholder="Enter sell price (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sellDate">Sell Date</label>
                    <input id="sellDate" type="date" {...register('sellDate')} disabled={!sellPrice} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Images & Notes */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                className="form-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="step-title">Images & Notes</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="collectionId">Collection</label>
                    <select id="collectionId" {...register('collectionId')}>
                      <option value="">Select a collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Card Images</label>
                    <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      {...register('notes')}
                      rows={4}
                      placeholder="Enter any additional notes about this card..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation */}
          <motion.div
            className="step-navigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="step-buttons">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="step-btn prev-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Previous
                </motion.button>
              )}

              <div className="step-spacer" />

              {currentStep < steps.length ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="step-btn next-btn"
                  disabled={Object.keys(validationErrors).length > 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  className="step-btn submit-btn"
                  disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Card' : 'Add Card'}
                </motion.button>
              )}
            </div>

            <div className="step-actions">
              <button type="button" onClick={onCancel} className="cancel-btn" disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
