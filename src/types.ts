

export interface PredictionStep {
  row: number;
  col: number;
}

export interface PredictionResult {
  path: number[]; // Array of column indices (0-4) for rows 0-9
  confidence: number;
  id: string;
  timestamp: number;
  analysis: string;
  gridData?: boolean[][];
}

export interface CrashPredictionResult {
  predictedCrash: number;
  safeCashout: number;
  confidence: number;
  id: string;
  timestamp: number;
  analysis: string;
  history: number[]; // Simulated history for context
}

export interface MinesPredictionResult {
  safeSpots: number[]; // Array of indices (0-24) representing safe spots
  confidence: number;
  id: string;
  analysis: string;
}

export interface WildWestPredictionResult {
  safeSpots: number[];
  bountyMultipliers: number[];
  confidence: number;
  id: string;
  analysis: string;
}

export enum GameState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PREDICTED = 'PREDICTED',
  ERROR = 'ERROR'
}

export interface GridConfig {
  rows: number;
  cols: number;
}

export type ViewState = 'SPLASH' | 'LOGIN' | 'SELECTION' | 'APPLE' | 'CRASH' | 'MINES' | 'PROFILE' | 'NOTIFICATIONS' | 'ABOUT_DEV' | 'USERS_ONLINE' | 'WILD_WEST' | 'CHAT_SUPPORT' | 'LIVE_ANALYTICS' | 'GET_CODE';

export type Language = 'ar' | 'en';

export interface AccessKey {
  key: string;
  isActive: boolean;
  type: string; // "PERMANENT" or others
  name?: string;
  createdAt: number;
  expiresAt?: number;
  description?: string;
}

export interface UserProfile {
  username: string;
  joinDate: number;
  stats: {
    gamesPlayed: number;
    totalWinnings: number;
    rank: string;
    trustScore: number;
  };
  preferences: {
    notifications: boolean;
    sound: boolean;
    haptics: boolean;
    showBalance: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  description?: string;
  timestamp: number;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  titleKey?: string;
  messageKey?: string;
  sender?: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
    isTyping?: boolean;
    avatarId?: number;
    isAdmin?: boolean;
    isAi?: boolean;
}