import { useEffect } from 'react';
import { useCards } from '../context/CardContext';
import { saveCardsToStorage, loadCardsFromStorage } from '../utils/localStorage';

export const useLocalStorage = () => {
  const { state, setCards } = useCards();

  useEffect(() => {
    const savedCards = loadCardsFromStorage();
    if (savedCards.length > 0) {
      setCards(savedCards);
    }
  }, [setCards]);

  useEffect(() => {
    try {
      // Always save cards to storage, even if the array is empty
      saveCardsToStorage(state.cards);
    } catch (error) {
      console.error('Error in useLocalStorage effect:', error);
    }
  }, [state.cards]);

  return null;
};