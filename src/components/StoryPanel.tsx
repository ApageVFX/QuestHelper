import React, { useState, useEffect } from 'react';
import './StoryPanel.css';

interface StoryPanelProps {
  currentUser: any;
  onNotificationUpdate?: (count: number) => void;
}

export const StoryPanel: React.FC<StoryPanelProps> = ({ onNotificationUpdate }) => {
  const [story, setStory] = useState('');

  // Load story from localStorage on mount
  useEffect(() => {
    const savedStory = localStorage.getItem('questhelper-story');
    if (savedStory) {
      setStory(savedStory);
    } else {
      setStory('');
    }

    // Dla powiadomień - zawsze 0 w trybie localStorage
    if (onNotificationUpdate) {
      onNotificationUpdate(0);
    }
  }, [onNotificationUpdate]);

  // Save story to localStorage whenever story changes
  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStory = e.target.value;
    setStory(newStory);
    localStorage.setItem('questhelper-story', newStory);
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
          <small>Fabuła jest automatycznie zapisywana lokalnie</small>
        </div>
      </div>
    </div>
  );
};

export default StoryPanel;