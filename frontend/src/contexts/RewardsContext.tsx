import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Badge, Streak } from '../types';
import { db } from '../services/database';

interface RewardsState {
  badges: Badge[];
  loading: boolean;
  error: string | null;
}

type RewardsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BADGES'; payload: Badge[] }
  | { type: 'UNLOCK_BADGE'; payload: Badge }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: RewardsState = {
  badges: [],
  loading: false,
  error: null,
};

function rewardsReducer(state: RewardsState, action: RewardsAction): RewardsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BADGES':
      return { ...state, badges: action.payload, loading: false };
    case 'UNLOCK_BADGE':
      return {
        ...state,
        badges: state.badges.some(b => b.id === action.payload.id)
          ? state.badges
          : [...state.badges, action.payload],
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface RewardsContextType {
  state: RewardsState;
  checkAndAwardBadges: (streak: Streak, totalCheckIns: number) => Promise<Badge[]>;
  getUnlockedBadges: () => Badge[];
  refreshBadges: () => Promise<void>;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

// Badge definitions
const badgeDefinitions: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: 'streak-30', name: 'Month Master', description: 'Maintain a 30-day streak', icon: '⭐' },
  { id: 'streak-100', name: 'Century Club', description: 'Maintain a 100-day streak', icon: '💯' },
  { id: 'checkin-10', name: 'Getting Started', description: 'Complete 10 check-ins', icon: '🌱' },
  { id: 'checkin-50', name: 'Consistent', description: 'Complete 50 check-ins', icon: '📈' },
  { id: 'checkin-100', name: 'Dedicated', description: 'Complete 100 check-ins', icon: '🏆' },
];

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rewardsReducer, initialState);

  const refreshBadges = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const badges = await db.badges.toArray();
      dispatch({ type: 'SET_BADGES', payload: badges });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load badges' });
    }
  };

  const getUnlockedBadges = (): Badge[] => {
    return state.badges.filter(b => b.unlockedAt);
  };

  const checkAndAwardBadges = async (streak: Streak, totalCheckIns: number): Promise<Badge[]> => {
    const newlyUnlocked: Badge[] = [];

    for (const badgeDef of badgeDefinitions) {
      // Check if badge is already unlocked
      const existing = await db.badges.get(badgeDef.id);
      if (existing?.unlockedAt) continue;

      let shouldUnlock = false;

      // Check streak-based badges
      if (badgeDef.id.startsWith('streak-')) {
        const requiredStreak = parseInt(badgeDef.id.split('-')[1]);
        if (streak.currentStreak >= requiredStreak || streak.longestStreak >= requiredStreak) {
          shouldUnlock = true;
        }
      }

      // Check check-in based badges
      if (badgeDef.id.startsWith('checkin-')) {
        const requiredCheckIns = parseInt(badgeDef.id.split('-')[1]);
        if (totalCheckIns >= requiredCheckIns) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        const badge: Badge = {
          ...badgeDef,
          unlockedAt: new Date().toISOString(),
        };
        await db.badges.put(badge);
        dispatch({ type: 'UNLOCK_BADGE', payload: badge });
        newlyUnlocked.push(badge);
      }
    }

    return newlyUnlocked;
  };

  useEffect(() => {
    refreshBadges();
  }, []);

  return (
    <RewardsContext.Provider
      value={{
        state,
        checkAndAwardBadges,
        getUnlockedBadges,
        refreshBadges,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}

