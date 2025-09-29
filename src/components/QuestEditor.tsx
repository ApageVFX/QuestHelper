import React, { useState, useRef } from 'react';
import QuestNode from './QuestNode';
import './QuestEditor.css';

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

export const QuestEditor: React.FC = () => {
  const [quests, setQuests] = useState<Record<string, Quest>>({
    'quest1': {
      id: 'quest1',
      name: 'Ostatni Oddech Wiary',
      description: 'Znajdź i zbierz zmutowane owoce, aby odnaleźć pierwszego ocalałego. Przygotuj się na spotkanie z Korzennymi Stworami.',
      position: { x: 50, y: 150 },
      status: 'todo',
      color: '#34495e',
      nextQuestId: 'quest2',
      createdBy: 'SuperAdmin',
      createdAt: new Date(),
      lastModifiedBy: 'SuperAdmin',
      lastModifiedAt: new Date(),
      editHistory: [{
        action: 'created',
        user: 'SuperAdmin',
        timestamp: new Date()
      }]
    },
    'quest2': {
      id: 'quest2',
      name: 'Echo Szaleństwa',
      description: 'Zabij Zmutowane Wężokorzenie i odnajdź ukryte wejście do Laboratorium. Dziennik, który dostałeś od pierwszego ocalałego, może ci w tym pomóc.',
      position: { x: 350, y: 150 },
      status: 'todo',
      color: '#34495e',
      createdBy: 'SuperAdmin',
      createdAt: new Date(),
      lastModifiedBy: 'SuperAdmin',
      lastModifiedAt: new Date(),
      editHistory: [{
        action: 'created',
        user: 'SuperAdmin',
        timestamp: new Date()
      }]
    }
  });

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowEditor(true);
  };

  const handleQuestMove = (questId: string, newPosition: { x: number; y: number }) => {
    setQuests(prev => ({
      ...prev,
      [questId]: {
        ...prev[questId],
        position: newPosition
      }
    }));
  };

  const handleSaveQuest = () => {
    if (selectedQuest) {
      setQuests(prev => ({
        ...prev,
        [selectedQuest.id]: selectedQuest
      }));
      setShowEditor(false);
    }
  };

  const handleAddQuest = () => {
    const newId = `quest_${Date.now()}`;
    const newQuest: Quest = {
      id: newId,
      name: 'Nowy Quest',
      description: 'Opis questa',
      position: { x: 200, y: 200 },
      status: 'todo',
      color: '#34495e',
      createdBy: 'SuperAdmin',
      createdAt: new Date(),
      lastModifiedBy: 'SuperAdmin',
      lastModifiedAt: new Date(),
      editHistory: [{
        action: 'created',
        user: 'SuperAdmin',
        timestamp: new Date()
      }]
    };

    setQuests(prev => ({
      ...prev,
      [newId]: newQuest
    }));
    setSelectedQuest(newQuest);
    setShowEditor(true);
  };

  const findPreviousQuest = (_questId: string): Quest | null => {
    // Simplified implementation - always return null for now
    return null;
  };

  const findNextQuest = (questId: string): Quest | null => {
    const quest = quests[questId];
    if (!quest || !quest.nextQuestId) return null;
    return quests[quest.nextQuestId] || null;
  };

  const navigateToQuest = (quest: Quest | null) => {
    if (quest) {
      setSelectedQuest(quest);
    }
  };

  return (
    <div className="quest-editor">
      <div className="editor-toolbar">
        <button onClick={handleAddQuest} className="add-quest-btn">
          Dodaj nowego questa
        </button>
      </div>

      <div className="quest-map-container" ref={containerRef}>
        {Object.values(quests).map(quest => (
          <QuestNode
            key={quest.id}
            quest={quest}
            onEdit={handleQuestClick}
            onMove={handleQuestMove}
          />
        ))}

        {showEditor && selectedQuest && (
          <div className="quest-editor-modal">
            <div className="editor-content">
              <h3>Edytuj Quest</h3>

              <label>Nazwa:</label>
              <input
                type="text"
                value={selectedQuest.name}
                onChange={(e) => setSelectedQuest(prev => prev ? { ...prev, name: e.target.value } : null)}
              />

              <label>Opis:</label>
              <textarea
                value={selectedQuest.description}
                onChange={(e) => setSelectedQuest(prev => prev ? { ...prev, description: e.target.value } : null)}
              />

              <label>Kolor:</label>
              <input
                type="color"
                value={selectedQuest.color}
                onChange={(e) => setSelectedQuest(prev => prev ? { ...prev, color: e.target.value } : null)}
              />

              <div className="quest-navigation">
                <div className="navigation-buttons">
                  <div className="nav-group">
                    <span className="nav-label">Poprzedni:</span>
                    <button
                      onClick={() => navigateToQuest(findPreviousQuest(selectedQuest.id))}
                      disabled={!findPreviousQuest(selectedQuest.id)}
                      className="nav-btn prev-btn"
                      title={findPreviousQuest(selectedQuest.id)?.name || 'Brak poprzedniego questa'}
                    >
                      ⬅ {findPreviousQuest(selectedQuest.id)?.name || 'Brak'}
                    </button>
                  </div>

                  <div className="nav-group">
                    <span className="nav-label">Następny:</span>
                    <button
                      onClick={() => navigateToQuest(findNextQuest(selectedQuest.id))}
                      disabled={!findNextQuest(selectedQuest.id)}
                      className="nav-btn next-btn"
                      title={findNextQuest(selectedQuest.id)?.name || 'Brak następnego questa'}
                    >
                      {findNextQuest(selectedQuest.id)?.name || 'Brak'} ➡
                    </button>
                  </div>
                </div>
              </div>

              <div className="editor-buttons">
                <button onClick={handleSaveQuest} className="save-btn">Zapisz</button>
                <button onClick={() => setShowEditor(false)} className="cancel-btn">Anuluj</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestEditor;