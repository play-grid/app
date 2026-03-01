import type { FiveSecondsPlayer } from '@playgrid/five-seconds';
import { Trophy } from 'lucide-react';
import { Card } from './ui/card';

interface PlayerScoresProps {
  players: FiveSecondsPlayer[];
  currentPlayerId?: string;
}

export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {players.map(player => (
        <Card
          key={player.id}
          className={`p-4 flex items-center gap-3 transition-all ${
            player.id === currentPlayerId
              ? 'bg-accent text-accent-foreground border-accent scale-105'
              : 'bg-card border-border'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
            {player.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{player.name}</p>
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="w-4 h-4" />
              <span>{player.score}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// STILL NEED WORKING
// import type { FiveSecondsPlayer } from '@playgrid/five-seconds';
// import { Trophy, Zap } from 'lucide-react';
// import { useState } from 'react';

// interface PlayerScoresProps {
//   players: FiveSecondsPlayer[];
//   currentPlayerId?: string;
// }

// interface AnimationState {
//   prevPlayers: FiveSecondsPlayer[];
//   positionChanges: Map<string, { from: number; to: number }>;
//   animationKey: number;
// }

// export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
//   const [state, setState] = useState<AnimationState>({
//     prevPlayers: players,
//     // State initializer is intentionally eager: allocation is trivial and only used on first render.
//     // Using a lazy initializer provides no measurable benefit in this case.
//     // eslint-disable-next-line react/prefer-use-state-lazy-initialization
//     positionChanges: new Map(),
//     animationKey: 0,
//   });

//   if (players !== state.prevPlayers) {
//     const prevSorted = [...state.prevPlayers].sort((a, b) => b.score - a.score);
//     const currentSorted = [...players].sort((a, b) => b.score - a.score);
//     const newPositionChanges = new Map<string, { from: number; to: number }>();

//     let hasChanges = false;

//     currentSorted.forEach((player, newIndex) => {
//       const oldIndex = prevSorted.findIndex(p => p.id === player.id);

//       if (oldIndex !== -1 && oldIndex !== newIndex) {
//         newPositionChanges.set(player.id, { from: oldIndex, to: newIndex });
//         hasChanges = true;
//       }
//     });

//     setState({
//       prevPlayers: players,
//       positionChanges: newPositionChanges,
//       animationKey: hasChanges ? state.animationKey + 1 : state.animationKey,
//     });
//   }

//   const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
//   const topScore = sortedPlayers[0]?.score ?? 0;

//   return (
//     <div
//       className="fixed left-4 top-20 flex flex-col gap-2 w-48 z-10"
//       style={{ imageRendering: 'pixelated' }}
//     >
//       {sortedPlayers.map((player, index) => {
//         const isCurrentPlayer = player.id === currentPlayerId;
//         const isLeader = index === 0 && topScore > 0;
//         const positionChange = state.positionChanges.get(player.id);
//         const shouldAnimate = positionChange !== undefined;

//         // Calculate pixel distance to move (52px = height of card + gap)
//         const moveDistance = shouldAnimate ? (positionChange.from - positionChange.to) * 52 : 0;

//         return (
//           <div
//             key={`${player.id}-${state.animationKey}`}
//             className={shouldAnimate ? 'pixel-position-change' : undefined}
//             style={shouldAnimate
//               ? {
//                   '--move-distance': `${moveDistance}px`,
//                 } as React.CSSProperties
//               : undefined}
//           >
//             <div
//               className={`
//                 relative p-2 flex items-center gap-2
//                 ${isCurrentPlayer ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'}
//               `}
//               style={{ border: '2px solid currentColor' }}
//             >
//               {/* Rank */}
//               <div
//                 className={`
//                   w-6 h-6 flex items-center justify-center font-bold text-xs
//                   ${isLeader ? 'bg-urgency text-primary-foreground' : 'bg-muted text-muted-foreground'}
//                 `}
//                 style={{ border: '1px solid currentColor' }}
//               >
//                 {index + 1}
//               </div>

//               {/* Avatar */}
//               <div
//                 className={`
//                   w-8 h-8 flex items-center justify-center font-bold text-sm
//                   ${isCurrentPlayer ? 'bg-primary-foreground text-primary' : 'bg-secondary text-secondary-foreground'}
//                 `}
//                 style={{ border: '1px solid currentColor' }}
//               >
//                 {player.name?.[0]?.toUpperCase() ?? '?'}
//               </div>

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-1">
//                   {isCurrentPlayer && (
//                     <Zap className="w-3.5 h-3.5 text-success fill-current pixel-pulse" />
//                   )}
//                   <span className="font-bold text-xs truncate">{player.name}</span>
//                 </div>

//                 {/* Score bar */}
//                 <div className="mt-1 flex items-center gap-1">
//                   <div className="flex-1 h-2 bg-muted overflow-hidden">
//                     <div
//                       className={`h-full ${isCurrentPlayer ? 'bg-success' : 'bg-primary'}`}
//                       style={{
//                         width: topScore > 0 ? `${(player.score / topScore) * 100}%` : '0%',
//                         transition: 'width 400ms steps(8)',
//                       }}
//                     />
//                   </div>
//                   <span
//                     className={`
//                       text-xs font-bold shrink-0 w-6 text-right
//                       ${isCurrentPlayer ? 'text-primary-foreground' : 'text-foreground'}
//                     `}
//                   >
//                     {player.score}
//                   </span>
//                 </div>
//               </div>

//               {isLeader && <Trophy className="w-4 h-4 text-urgency" />}
//             </div>
//           </div>
//         );
//       })}

//       <style>
//         {`
//         @keyframes pixel-position-change {
//           0%   { transform: translateY(var(--move-distance)); }
//           100% { transform: translateY(0); }
//         }

//         @keyframes pixel-pulse {
//           0%, 100% { opacity: 1; }
//           50%      { opacity: 0.4; }
//         }

//         .pixel-position-change {
//           animation: pixel-position-change 500ms steps(8) forwards;
//         }

//         .pixel-pulse {
//           animation: pixel-pulse 1200ms steps(2) infinite;
//         }
//       `}
//       </style>
//     </div>
//   );
// }
