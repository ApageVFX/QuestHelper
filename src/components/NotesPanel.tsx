import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './NotesPanel.css';

interface NotesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  currentUser: any;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onToggle, currentUser }) => {
  const [notes, setNotes] = useState('');

  // Load notes from Firestore on mount
  useEffect(() => {
    const loadNotes = async () => {
      if (!currentUser?.uid) return;

      try {
        const notesDocRef = doc(db, 'users', currentUser.uid, 'data', 'notes');
        const notesDoc = await getDoc(notesDocRef);

        if (notesDoc.exists()) {
          const notesData = notesDoc.data();
          setNotes(notesData.content || '');
        } else {
          setNotes('');
        }
      } catch (error) {
        console.error('Błąd ładowania notatek z Firestore:', error);
        setNotes('');
      }
    };

    loadNotes();
  }, [currentUser?.uid]);

  // Save notes to Firestore whenever notes change
  useEffect(() => {
    const saveNotes = async () => {
      if (!currentUser?.uid) return;

      try {
        const notesDocRef = doc(db, 'users', currentUser.uid, 'data', 'notes');
        await setDoc(notesDocRef, {
          content: notes,
          lastModified: new Date()
        });
      } catch (error) {
        console.error('Błąd zapisywania notatek do Firestore:', error);
      }
    };

    saveNotes();
  }, [notes, currentUser?.uid]);

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
            <small>Notatki są automatycznie zapisywane w chmurze</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotesPanel;