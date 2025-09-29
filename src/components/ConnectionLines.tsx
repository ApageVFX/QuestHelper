import React from 'react';

interface Quest {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  status: 'todo' | 'in-progress' | 'completed';
  color: string;
  nextQuestId?: string;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  editHistory: any[];
}

interface ConnectionLinesProps {
  quests: Record<string, Quest>;
  onConnectionClick?: (fromQuest: Quest, toQuest: Quest) => void;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ quests, onConnectionClick }) => {
  const connections: { from: Quest; to: Quest }[] = [];

  // Znajdź wszystkie połączenia
  Object.values(quests).forEach(quest => {
    if (quest.nextQuestId && quests[quest.nextQuestId]) {
      connections.push({
        from: quest,
        to: quests[quest.nextQuestId]
      });
    }
  });

  // Funkcja do obliczania punktów połączenia (wychodzi z krawędzi, wchodzi do środka)
  const getConnectionPoints = (from: Quest, to: Quest) => {
    const fromX = from.position.x + 200; // prawa krawędź węzła źródłowego
    const fromY = from.position.y + 40;  // środek wysokości węzła źródłowego
    const toX = to.position.x + 100;     // środek węzła docelowego
    const toY = to.position.y + 40;      // środek wysokości węzła docelowego

    return { fromX, fromY, toX, toY };
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {connections.map(({ from, to }, index) => {
        const { fromX, fromY, toX, toY } = getConnectionPoints(from, to);

        // Oblicz punkty kontrolne dla bardziej wygiętej krzywej
        const distance = Math.abs(toX - fromX);
        const curveHeight = Math.min(distance * 0.3, 80); // Maksymalnie 80px wygięcia

        const controlPoint1X = fromX + distance * 0.3;
        const controlPoint1Y = fromY - curveHeight;
        const controlPoint2X = toX - distance * 0.3;
        const controlPoint2Y = toY - curveHeight;

        return (
          <g
            key={`${from.id}-${to.id}-${index}`}
            style={{ cursor: 'pointer' }}
            onClick={() => onConnectionClick?.(from, to)}
          >
            {/* Główna linia */}
            <path
              d={`M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`}
              stroke="#3498db"
              strokeWidth="3"
              fill="none"
              opacity="0.7"
            />
            {/* Strzałka na końcu */}
            <polygon
              points={`${toX},${toY} ${toX-8},${toY-4} ${toX-8},${toY+4}`}
              fill="#3498db"
              opacity="0.9"
            />
          </g>
        );
      })}
    </svg>
  );
};

export default ConnectionLines;