import { Badge } from '../types';
import { format } from 'date-fns';

interface BadgeDisplayProps {
  badges: Badge[];
  showUnlockedOnly?: boolean;
}

export default function BadgeDisplay({ badges, showUnlockedOnly = false }: BadgeDisplayProps) {
  const displayBadges = showUnlockedOnly
    ? badges.filter(b => b.unlockedAt)
    : badges;

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No badges {showUnlockedOnly ? 'unlocked' : 'available'} yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayBadges.map(badge => (
        <div
          key={badge.id}
          className={`p-4 rounded-lg border-2 transition-all ${
            badge.unlockedAt
              ? 'bg-primary-50 border-primary-300 shadow-md'
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}
        >
          <div className="text-4xl text-center mb-2">{badge.icon || '🏆'}</div>
          <h4 className="font-semibold text-sm text-gray-800 text-center">{badge.name}</h4>
          <p className="text-xs text-gray-600 text-center mt-1">{badge.description}</p>
          {badge.unlockedAt && (
            <p className="text-xs text-primary-600 text-center mt-2">
              Unlocked: {format(new Date(badge.unlockedAt), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

