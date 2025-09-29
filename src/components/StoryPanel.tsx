import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import './StoryPanel.css';

interface StoryPanelProps {
  currentUser: any;
  onNotificationUpdate?: (count: number) => void;
}

export const StoryPanel: React.FC<StoryPanelProps> = ({ currentUser, onNotificationUpdate }) => {
  const [story, setStory] = useState('');

  // Load story from Firestore in real-time
  useEffect(() => {
    if (!currentUser?.uid) return;

    const storyDocRef = doc(db, 'users', currentUser.uid, 'data', 'story');

    // Real-time listener dla fabuły
    const unsubscribe = onSnapshot(storyDocRef, (docSnapshot) => {
      try {
        if (docSnapshot.exists()) {
          const storyData = docSnapshot.data();
          setStory(storyData.content || '');
        } else {
          setStory('');
        }
      } catch (error) {
        console.error('Błąd ładowania fabuły z Firestore:', error);
        setStory('');
      }
    });

    // Dla powiadomień - zawsze 0 (fabuła jest już w czasie rzeczywistym)
    if (onNotificationUpdate) {
      onNotificationUpdate(0);
    }

    // Cleanup listener przy odmontowaniu komponentu
    return () => unsubscribe();
  }, [currentUser?.uid]); // Uruchamia się przy zmianie użytkownika

  // Save story to Firestore whenever story changes
  const handleStoryChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    setStory(newStory);

    if (!currentUser?.uid) return;

    try {
      const storyDocRef = doc(db, 'users', currentUser.uid, 'data', 'story');
      await setDoc(storyDocRef, {
        content: newStory,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Błąd zapisywania fabuły do Firestore:', error);
    }
  };

  return (
    <div className="story-panel-container">
      <div className="story-header">
        <h2>Fabuła / Story</h2>
        <p>Opisz fabułę swojego świata, główne wątki narracyjne i historię</p>
      </div>

      <div className="story-content">
        <textarea
          className="story-textarea"
          placeholder="Wpisz fabułę swojego projektu, główne wątki narracyjne, historię świata, postaci, wydarzenia..."
          value={story}
          onChange={handleStoryChange}
        />
        <div className="story-footer">
          <small>Fabuła jest automatycznie zapisywana w chmurze</small>
        </div>
      </div>
    </div>
  );
};

export default StoryPanel;