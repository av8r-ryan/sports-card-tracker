import { Card, User } from '../types';
import { logDebug, logInfo, logError } from '../utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface CardInput {
  player: string;
  team: string;
  year: number;
  brand: string;
  category: string;
  cardNumber: string;
  parallel?: string;
  condition: string;
  gradingCompany?: string;
  purchasePrice: number;
  purchaseDate: string;
  sellPrice?: number;
  sellDate?: string;
  currentValue: number;
  images: string[];
  notes: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    logDebug('ApiService', `Making request to ${url}`, { method: options.method || 'GET' });

    // Get auth token from localStorage
    const token = localStorage.getItem('token');

    logDebug('ApiService', `Token status for ${url}`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        logError('ApiService', `HTTP Error for ${url}`, new Error(errorMessage));
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return {} as T; // No content response
      }

      const data = await response.json();
      logDebug('ApiService', `Response received from ${url}`, data);
      return data;
    } catch (error) {
      // Enhanced error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error(`Network error: Unable to connect to ${url}. Make sure the server is running.`);
        logError('ApiService', `Network error for ${url}`, networkError);
        throw networkError;
      }

      logError('ApiService', `Request failed for ${url}`, error as Error);
      throw error;
    }
  }

  public async getAllCards(): Promise<Card[]> {
    try {
      logInfo('ApiService', 'Fetching all cards');
      const cards = await this.request<Card[]>('/cards');

      // Convert date strings back to Date objects
      const processedCards = cards.map((card) => ({
        ...card,
        purchaseDate: new Date(card.purchaseDate),
        sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
      }));

      logInfo('ApiService', `Fetched ${processedCards.length} cards`);
      return processedCards;
    } catch (error) {
      logError('ApiService', 'Failed to fetch cards', error as Error);
      throw error;
    }
  }

  public async getCard(id: string): Promise<Card> {
    try {
      logInfo('ApiService', `Fetching card ${id}`);
      const card = await this.request<Card>(`/cards/${id}`);

      // Convert date strings back to Date objects
      return {
        ...card,
        purchaseDate: new Date(card.purchaseDate),
        sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
      };
    } catch (error) {
      logError('ApiService', `Failed to fetch card ${id}`, error as Error);
      throw error;
    }
  }

  public async createCard(cardData: Card): Promise<Card> {
    try {
      logInfo('ApiService', 'Creating new card', { player: cardData.player });

      const cardInput: CardInput = {
        player: cardData.player,
        team: cardData.team,
        year: cardData.year,
        brand: cardData.brand,
        category: cardData.category,
        cardNumber: cardData.cardNumber,
        parallel: cardData.parallel,
        condition: cardData.condition,
        gradingCompany: cardData.gradingCompany,
        purchasePrice: cardData.purchasePrice,
        purchaseDate: cardData.purchaseDate.toISOString(),
        sellPrice: cardData.sellPrice,
        sellDate: cardData.sellDate?.toISOString(),
        currentValue: cardData.currentValue,
        images: cardData.images,
        notes: cardData.notes,
      };

      const card = await this.request<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify(cardInput),
      });

      // Convert date strings back to Date objects
      return {
        ...card,
        purchaseDate: new Date(card.purchaseDate),
        sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
      };
    } catch (error) {
      logError('ApiService', 'Failed to create card', error as Error, cardData);
      throw error;
    }
  }

  public async updateCard(cardData: Card): Promise<Card> {
    try {
      logInfo('ApiService', `Updating card ${cardData.id}`, { player: cardData.player });

      const cardInput: CardInput = {
        player: cardData.player,
        team: cardData.team,
        year: cardData.year,
        brand: cardData.brand,
        category: cardData.category,
        cardNumber: cardData.cardNumber,
        parallel: cardData.parallel,
        condition: cardData.condition,
        gradingCompany: cardData.gradingCompany,
        purchasePrice: cardData.purchasePrice,
        purchaseDate: cardData.purchaseDate.toISOString(),
        sellPrice: cardData.sellPrice,
        sellDate: cardData.sellDate?.toISOString(),
        currentValue: cardData.currentValue,
        images: cardData.images,
        notes: cardData.notes,
      };

      const card = await this.request<Card>(`/cards/${cardData.id}`, {
        method: 'PUT',
        body: JSON.stringify(cardInput),
      });

      // Convert date strings back to Date objects
      return {
        ...card,
        purchaseDate: new Date(card.purchaseDate),
        sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
      };
    } catch (error) {
      logError('ApiService', `Failed to update card ${cardData.id}`, error as Error, cardData);
      throw error;
    }
  }

  public async deleteCard(id: string): Promise<void> {
    try {
      logInfo('ApiService', `Deleting card ${id}`);
      await this.request<void>(`/cards/${id}`, {
        method: 'DELETE',
      });
      logInfo('ApiService', `Card ${id} deleted successfully`);
    } catch (error) {
      logError('ApiService', `Failed to delete card ${id}`, error as Error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      logDebug('ApiService', 'Performing health check');
      return await this.request<{ status: string; message: string }>('/health');
    } catch (error) {
      logError('ApiService', 'Health check failed', error as Error);
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    logInfo('ApiService', 'Attempting login', { email });
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token in localStorage
    localStorage.setItem('token', response.token);
    logInfo('ApiService', 'Login successful, token stored', { userId: response.user.id });

    return response;
  }

  public async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    logInfo('ApiService', 'Attempting registration', { username, email });
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    // Store token in localStorage
    localStorage.setItem('token', response.token);
    logInfo('ApiService', 'Registration successful, token stored', { userId: response.user.id });

    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
