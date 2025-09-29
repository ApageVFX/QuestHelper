import React, { useState, useEffect } from 'react';
import type { QuestLine } from '../types';
import './QuestLineList.css';

interface QuestLineListProps {
  onSelectQuestLine: () => void;
  currentUser: any;
  onNotificationUpdate?: (count: number) => void;
}

export const QuestLineList: React.FC<QuestLineListProps> = ({ onSelectQuestLine, onNotificationUpdate }) => {
  const [questLines, setQuestLines] = useState<Record<string, QuestLine>>({});

  // Ładuj questline'y z localStorage przy montowaniu komponentu
  useEffect(() => {
    const savedQuestLines = localStorage.getItem('questhelper-questlines');
    if (savedQuestLines) {
      try {
        const parsedQuestLines = JSON.parse(savedQuestLines);
        // Konwertuj daty z string na Date objects
        Object.values(parsedQuestLines).forEach((questLine: any) => {
          questLine.lastModified = new Date(questLine.lastModified);
        });
        setQuestLines(parsedQuestLines);
      } catch (error) {
        console.error('Błąd ładowania questline\'ów z localStorage:', error);
        setDefaultQuestLines();
      }
    } else {
      setDefaultQuestLines();
    }

    // Dla powiadomień - zawsze 0 w trybie localStorage
    if (onNotificationUpdate) {
      onNotificationUpdate(0);
    }
  }, [onNotificationUpdate]);

  const setDefaultQuestLines = () => {
    const defaultQuestLines: Record<string, QuestLine> = {
      'ql1': {
        id: 'ql1',
        name: 'Główna Linia Questów',
        description: 'Podstawowa sekwencja misji dla nowych graczy',
        questCount: 2,
        lastModified: new Date(),
        color: '#3498db'
      }
    };
    setQuestLines(defaultQuestLines);
  };

  // Zapisz questline'y w localStorage
  const saveQuestLines = (updatedQuestLines: Record<string, QuestLine>) => {
    localStorage.setItem('questhelper-questlines', JSON.stringify(updatedQuestLines));
  };

  // Dodaj nowy questline
  const addNewQuestLine = () => {
    const newId = `ql${Date.now()}`;
    const newQuestLine: QuestLine = {
      id: newId,
      name: 'Nowy Quest Line',
      description: 'Opis nowego quest line\'u',
      questCount: 0,
      lastModified: new Date(),
      color: '#34495e'
    };

    const updatedQuestLines = { ...questLines, [newId]: newQuestLine };
    setQuestLines(updatedQuestLines);
    saveQuestLines(updatedQuestLines);
  };

  // Automatyczne zapisywanie przy każdej zmianie
  useEffect(() => {
    if (Object.keys(questLines).length > 0) {
      saveQuestLines(questLines);
    }
  }, [questLines]);

  return (
    <div className="questline-list-container">
      <div className="questline-header">
        <h2>Quest Line'y</h2>
        <button className="add-questline-btn" onClick={addNewQuestLine}>+ Nowy Quest Line</button>
      </div>

      <div className="questline-grid">
        {Object.values(questLines).map(questLine => (
          <div
            key={questLine.id}
            className="questline-card"
            onClick={() => onSelectQuestLine()}
            style={{ borderLeftColor: questLine.color }}
          >
            <div className="questline-id">#{questLine.id}</div>
            <div className="questline-card-header">
              <h3>{questLine.name}</h3>
              <span className="quest-count">{questLine.questCount} questów</span>
            </div>
            <p className="questline-description">{questLine.description}</p>
            <div className="questline-meta">
              <span className="last-modified">
                Ostatnia zmiana: {questLine.lastModified.toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestLineList;