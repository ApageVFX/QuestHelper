import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import QuestNode from './QuestNode';
import ConnectionLines from './ConnectionLines';
import './QuestMap.css';

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

interface QuestMapProps {
  currentUser: any;
  onNotificationUpdate?: (count: number) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({ currentUser, onNotificationUpdate }) => {
  const [, setIsCanvasDragging] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Aplikuj zoom do canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `scale(${zoom})`;
      canvasRef.current.style.transformOrigin = 'top left';
    }
  }, [zoom]);

  const [quests, setQuests] = useState<Record<string, Quest>>({});

  // Ładuj questy z Firestore w czasie rzeczywistym
  useEffect(() => {
    if (!currentUser?.uid) return;

    const questsDocRef = doc(db, 'users', currentUser.uid, 'data', 'quests');

    // Real-time listener dla questów
    const unsubscribe = onSnapshot(questsDocRef, (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const questsData = docSnapshot.data();
          const parsedQuests = questsData.quests || {};

          // Konwertuj daty z string na Date objects
          Object.values(parsedQuests).forEach((quest: any) => {
            quest.createdAt = new Date(quest.createdAt);
            quest.lastModifiedAt = new Date(quest.lastModifiedAt);
            quest.editHistory = quest.editHistory?.map((entry: any) => ({
              ...entry,
              timestamp: new Date(entry.timestamp)
            })) || [];
          });
          setQuests(parsedQuests);
        } else {
          setDefaultQuests();
        }
      } catch (error) {
        console.error('Błąd ładowania questów z Firestore:', error);
        setDefaultQuests();
      }
    });

    // Dla powiadomień - zawsze 0 (questy są już w czasie rzeczywistym)
    if (onNotificationUpdate) {
      onNotificationUpdate(0);
    }

    // Cleanup listener przy odmontowaniu komponentu
    return () => unsubscribe();
  }, [currentUser?.uid, onNotificationUpdate]);

  const setDefaultQuests = () => {
    const defaultQuests: Record<string, Quest> = {
      'Q001': {
        id: 'Q001',
        name: 'Ostatni Oddech Wiary',
        description: 'Znajdź i zbierz zmutowane owoce, aby odnaleźć pierwszego ocalałego. Przygotuj się na spotkanie z Korzennymi Stworami.',
        position: { x: 150, y: 200 },
        status: 'todo',
        color: '#34495e',
        nextQuestId: 'Q002',
        createdBy: currentUser?.name || 'User',
        createdAt: new Date(),
        lastModifiedBy: currentUser?.name || 'User',
        lastModifiedAt: new Date(),
        editHistory: [{
          action: 'created',
          user: currentUser?.name || 'User',
          timestamp: new Date()
        }]
      },
      'Q002': {
        id: 'Q002',
        name: 'Echo Szaleństwa',
        description: 'Zabij Zmutowane Wężokorzenie i odnajdź ukryte wejście do Laboratorium. Dziennik, który dostałeś od pierwszego ocalałego, może ci w tym pomóc.',
        position: { x: 400, y: 200 },
        status: 'todo',
        color: '#34495e',
        createdBy: currentUser?.name || 'User',
        createdAt: new Date(),
        lastModifiedBy: currentUser?.name || 'User',
        lastModifiedAt: new Date(),
        editHistory: [{
          action: 'created',
          user: currentUser?.name || 'User',
          timestamp: new Date()
        }]
      }
    };

    setQuests(defaultQuests);
  };

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Funkcja do centrowania widoku na questcie
  const centerViewOnQuest = (quest: Quest) => {
    const canvas = document.querySelector('.quest-canvas') as HTMLElement;
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const questX = quest.position.x - canvasRect.width / 2 + 100; // offset dla węzła
      const questY = quest.position.y - canvasRect.height / 2 + 50;

      canvas.scrollTo({
        left: Math.max(0, questX),
        top: Math.max(0, questY),
        behavior: 'smooth'
      });
    }
  };

  // Znajdź poprzedni quest (ten który wskazuje na obecny)
  const findPreviousQuest = (currentQuest: Quest): Quest | null => {
    return Object.values(quests).find(q => q.nextQuestId === currentQuest.id) || null;
  };

  // Nawigacja do questa z centrowaniem
  const navigateToQuest = (quest: Quest | null) => {
    if (quest) {
      setSelectedQuest(quest);
      centerViewOnQuest(quest);
    }
  };

  // Obsługa przeciągania canvas (przesuwanie widoku)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Tylko jeśli kliknięto na puste miejsce (nie na węzeł)
    if ((e.target as HTMLElement).classList.contains('quest-canvas')) {
      e.preventDefault();
      setIsCanvasDragging(true);
      setCanvasDragStart({ x: e.clientX, y: e.clientY });
      const canvas = e.currentTarget as HTMLElement;
      const startScrollLeft = canvas.scrollLeft;
      const startScrollTop = canvas.scrollTop;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const deltaX = e.clientX - canvasDragStart.x;
        const deltaY = e.clientY - canvasDragStart.y;
        canvas.scrollLeft = startScrollLeft - deltaX;
        canvas.scrollTop = startScrollTop - deltaY;
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        setIsCanvasDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Obsługa zoom za pomocą scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out / zoom in
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor)); // Ogranicz zoom od 0.1x do 5x
    setZoom(newZoom);
  };

  // Oblicz numer questu w sekwencji
  const calculateQuestNumber = (questId: string): number | undefined => {
    const quest = quests[questId];
    if (!quest) return undefined;

    // Znajdź początek łańcucha (quest bez poprzednika)
    let current = quest;
    let count = 1;

    // Idź do początku łańcucha
    while (true) {
      const prevQuest = findPreviousQuest(current);
      if (!prevQuest) break;
      current = prevQuest;
      count++;
    }

    // Teraz policz od początku do naszego questa
    let position = 1;
    let chainQuest = current;

    while (chainQuest.id !== questId) {
      if (!chainQuest.nextQuestId) break;
      chainQuest = quests[chainQuest.nextQuestId];
      if (!chainQuest) break;
      position++;
    }

    return position;
  };

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowEditor(true);
  };

  const handleQuestMove = (questId: string, newPosition: { x: number; y: number }) => {
    // Ogranicz pozycję węzła do obszaru roboczego (z marginesami)
    const clampedPosition = {
      x: Math.max(-50, Math.min(3850, newPosition.x)), // -50 do 3850 (szerokość canvas - szerokość węzła)
      y: Math.max(-50, Math.min(3850, newPosition.y))  // -50 do 3850
    };

    setQuests(prev => ({
      ...prev,
      [questId]: {
        ...prev[questId],
        position: clampedPosition
      }
    }));
  };

  const handleSaveQuest = () => {
    if (selectedQuest) {
      const originalQuest = quests[selectedQuest.id];
      const changes: Record<string, any> = {};

      // Compare and track changes
      if (originalQuest.name !== selectedQuest.name) changes.name = { from: originalQuest.name, to: selectedQuest.name };
      if (originalQuest.description !== selectedQuest.description) changes.description = { from: originalQuest.description, to: selectedQuest.description };
      if (originalQuest.status !== selectedQuest.status) changes.status = { from: originalQuest.status, to: selectedQuest.status };
      if (originalQuest.color !== selectedQuest.color) changes.color = { from: originalQuest.color, to: selectedQuest.color };
      if (originalQuest.nextQuestId !== selectedQuest.nextQuestId) changes.nextQuestId = { from: originalQuest.nextQuestId, to: selectedQuest.nextQuestId };

      const updatedQuest = {
        ...selectedQuest,
        lastModifiedBy: currentUser?.name || 'Unknown',
        lastModifiedAt: new Date(),
        editHistory: [
          ...selectedQuest.editHistory,
          {
            action: 'edited',
            user: currentUser?.name || 'Unknown',
            timestamp: new Date(),
            changes: Object.keys(changes).length > 0 ? changes : undefined
          }
        ]
      };

      setQuests(prev => ({
        ...prev,
        [selectedQuest.id]: updatedQuest
      }));
      setShowEditor(false);
    }
  };

  // Funkcja generująca systematyczne ID questów
  const generateQuestId = (): string => {
    const questNumbers = Object.keys(quests)
      .map(id => {
        const match = id.match(/^Q(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = questNumbers.length > 0 ? Math.max(...questNumbers) + 1 : 1;
    return `Q${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAddQuest = () => {
    const newId = generateQuestId();
    const newQuest: Quest = {
      id: newId,
      name: 'Nowy Quest',
      description: 'Opis questa',
      position: { x: 300, y: 300 },
      status: 'todo',
      color: '#34495e',
      createdBy: currentUser?.name || 'Unknown',
      createdAt: new Date(),
      lastModifiedBy: currentUser?.name || 'Unknown',
      lastModifiedAt: new Date(),
      editHistory: [{
        action: 'created',
        user: currentUser?.name || 'Unknown',
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

  // Automatyczne zapisywanie questów w Firestore
  useEffect(() => {
    const saveQuests = async () => {
      if (!currentUser?.uid || Object.keys(quests).length === 0) return;

      try {
        const questsDocRef = doc(db, 'users', currentUser.uid, 'data', 'quests');
        await setDoc(questsDocRef, {
          quests,
          lastModified: new Date()
        });
      } catch (error) {
        console.error('Błąd zapisywania questów do Firestore:', error);
      }
    };

    saveQuests();
  }, [quests, currentUser?.uid]);

  return (
    <div className="quest-map-container">
      <div className="map-toolbar">
        <button onClick={handleAddQuest} className="add-quest-btn">
          Dodaj nowego questa
        </button>
      </div>

      <div
        ref={canvasRef}
        className="quest-canvas"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        <ConnectionLines
          quests={quests}
          onConnectionClick={(fromQuest: Quest, toQuest: Quest) => {
            // Tutaj można dodać logikę - np. usunięcie połączenia lub pokazanie szczegółów
            if (window.confirm(`Usunąć połączenie między "${fromQuest.name}" a "${toQuest.name}"?`)) {
              // Usuń połączenie
              setQuests(prev => ({
                ...prev,
                [fromQuest.id]: {
                  ...prev[fromQuest.id],
                  nextQuestId: undefined
                }
              }));
            }
          }}
        />
        {Object.values(quests).map(quest => (
          <QuestNode
            key={quest.id}
            quest={quest}
            onEdit={handleQuestClick}
            onMove={handleQuestMove}
            questNumber={calculateQuestNumber(quest.id)}
          />
        ))}
      </div>

      {/* Left panel editor */}
      <div className={`editor-panel ${showEditor ? 'open' : ''}`}>
        <div className="editor-header">
          <h3>Edytuj Quest</h3>
          <button onClick={() => setShowEditor(false)} className="close-editor-btn">×</button>
        </div>

        {selectedQuest && (
          <div className="editor-content">
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

            <label>Status:</label>
            <select
              value={selectedQuest.status}
              onChange={(e) => setSelectedQuest(prev => prev ? { ...prev, status: e.target.value as 'todo' | 'in-progress' | 'completed' } : null)}
            >
              <option value="todo">Do zrobienia</option>
              <option value="in-progress">W trakcie</option>
              <option value="completed">Ukończone</option>
            </select>

            <label>Następny quest:</label>
            <select
              value={selectedQuest.nextQuestId || ''}
              onChange={(e) => setSelectedQuest(prev => prev ? { ...prev, nextQuestId: e.target.value || undefined } : null)}
            >
              <option value="">Brak</option>
              {Object.values(quests)
                .filter(q => q.id !== selectedQuest.id)
                .map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
            </select>

            {/* Przyciski nawigacji */}
            {selectedQuest && (
              <div className="quest-navigation">
                {findPreviousQuest(selectedQuest) && (
                  <button
                    onClick={() => navigateToQuest(findPreviousQuest(selectedQuest))}
                    className="nav-btn prev-btn"
                  >
                    ← Poprzedni quest
                  </button>
                )}
                {selectedQuest.nextQuestId && quests[selectedQuest.nextQuestId] && (
                  <button
                    onClick={() => navigateToQuest(quests[selectedQuest.nextQuestId!])}
                    className="nav-btn next-btn"
                  >
                    Następny quest →
                  </button>
                )}
              </div>
            )}

            <div className="edit-history">
              <h4>Historia edycji</h4>
              <div className="history-list">
                {selectedQuest.editHistory
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((entry, index) => (
                    <div key={index} className="history-entry">
                      <div className="history-header">
                        <span className="history-action">{entry.action}</span>
                        <span className="history-user">{entry.user}</span>
                        <span className="history-time">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: pl })}
                        </span>
                      </div>
                      {entry.changes && (
                        <div className="history-changes">
                          {Object.entries(entry.changes).map(([field, change]: [string, any]) => (
                            <div key={field} className="change-item">
                              <strong>{field}:</strong> {change.from || 'brak'} → {change.to || 'brak'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="editor-actions">
              <button onClick={handleSaveQuest} className="save-btn">Zapisz</button>
              <button onClick={() => setShowEditor(false)} className="cancel-btn">Anuluj</button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close editor */}
      {showEditor && <div className="editor-overlay" onClick={() => setShowEditor(false)}></div>}
    </div>
  );
};

export default QuestMap;