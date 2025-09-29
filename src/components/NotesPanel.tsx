import React, { useState, useEffect } from 'react';
import './NotesPanel.css';

interface NotesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  currentUser: any;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onToggle }) => {
  const [notes, setNotes] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('questhelper-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('questhelper-notes', notes);
  }, [notes]);

  return (
    <>
      {/* Notes toggle button */}
      <button
        className={`notes-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Zamknij notatki' : 'Otwórz notatki'}
      >
        📝
      </button>

      {/* Notes panel */}
      <div className={`notes-panel ${isOpen ? 'open' : ''}`}>
        <div className="notes-header">
          <h3>Notatki projektu</h3>
          <button onClick={onToggle} className="notes-close-btn">×</button>
        </div>

        <div className="notes-content">
          <textarea
            className="notes-textarea"
            placeholder="Wpisz swoje notatki, pomysły, uwagi..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="notes-footer">
            <small>Notatki są automatycznie zapisywane lokalnie</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotesPanel;