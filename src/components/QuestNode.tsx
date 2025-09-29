import React, { useState } from 'react';
import './QuestNode.css';

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

interface QuestNodeProps {
  quest: Quest;
  onEdit: (quest: Quest) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  questNumber?: number;
}

export const QuestNode: React.FC<QuestNodeProps> = ({ quest, onEdit, onMove, questNumber }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Otwórz panel tylko jeśli nie było przeciągania
    if (!dragStarted) {
      onEdit(quest);
    }
    setDragStarted(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStarted(false);
    const startX = e.clientX - quest.position.x;
    const startY = e.clientY - quest.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setDragStarted(true);
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      onMove(quest.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`quest-node ${quest.status} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: quest.position.x,
        top: quest.position.y,
        backgroundColor: quest.color,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {questNumber && (
        <div className="quest-number">{questNumber}</div>
      )}
      <h4>{quest.name}</h4>
      <p>{quest.description}</p>
    </div>
  );
};

export default QuestNode;