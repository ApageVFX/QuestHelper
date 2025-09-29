import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import LoginModal from './components/LoginModal';
import QuestMap from './components/QuestMap';
import QuestLineList from './components/QuestLineList';
import NotesCategoriesList from './components/NotesCategoriesList';
import StoryPanel from './components/StoryPanel';
import ChatPanel from './components/ChatPanel';
import NotesPanel from './components/NotesPanel';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<'questline' | 'projects' | 'notes' | 'story'>('questline');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    questline: 0,
    projects: 0,
    notes: 0,
    story: 0
  });

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setShowLogin(false);
    document.title = `Quest Line Editor - ${user.name}`;
  };

  // Zmiana zakładki - zapisuje czas odwiedzenia i zeruje powiadomienia
  const handleTabChange = async (tab: 'questline' | 'projects' | 'notes' | 'story') => {
    setActiveTab(tab);
    updateNotifications(tab, 0);
    await markTabAsVisited(tab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    document.title = 'Quest Line Editor';
  };

  // Zapisz czas ostatniego odwiedzenia zakładki
  const markTabAsVisited = async (tab: string) => {
    if (!currentUser?.uid) return;

    const visitsDocRef = doc(db, 'users', currentUser.uid, 'data', 'tab-visits');
    const visitsData = { [tab]: new Date() };
    await setDoc(visitsDocRef, visitsData, { merge: true });
  };

  // Zaktualizuj powiadomienia dla zakładki
  const updateNotifications = (tab: string, count: number) => {
    setNotifications(prev => ({
      ...prev,
      [tab]: count
    }));
  };

  return (
    <AuthProvider>
      <div className="App">
        {showLogin ? (
          <LoginModal onLogin={handleLogin} />
        ) : (
          <div className="quest-editor">
            <header className="app-header">
              <h1>Quest Line Editor</h1>
              <div className="header-content">
                <div className="tabs">
                  <button
                    className={`tab-btn ${activeTab === 'questline' ? 'active' : ''}`}
                    onClick={() => handleTabChange('questline')}
                  >
                    Lista Quest Line'ów
                    {notifications.questline > 0 && (
                      <span className="notification-badge">{notifications.questline}</span>
                    )}
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => handleTabChange('projects')}
                  >
                    Edytor Questów
                    {notifications.projects > 0 && (
                      <span className="notification-badge">{notifications.projects}</span>
                    )}
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`}
                    onClick={() => handleTabChange('story')}
                  >
                    Fabuła
                    {notifications.story > 0 && (
                      <span className="notification-badge">{notifications.story}</span>
                    )}
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => handleTabChange('notes')}
                  >
                    Notatki
                    {notifications.notes > 0 && (
                      <span className="notification-badge">{notifications.notes}</span>
                    )}
                  </button>
                </div>
                <div className="user-info">
                  <span className="user-name">Zalogowany jako: {currentUser?.name}</span>
                  <span className="user-role">({currentUser?.role})</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Wyloguj
                  </button>
                </div>
              </div>
            </header>

            {activeTab === 'questline' ? (
              <QuestLineList
                onSelectQuestLine={() => {
                  handleTabChange('projects');
                  // Tutaj można dodać logikę ładowania wybranego quest line
                }}
                currentUser={currentUser}
                onNotificationUpdate={(count) => updateNotifications('questline', count)}
              />
            ) : activeTab === 'story' ? (
              <StoryPanel
                currentUser={currentUser}
                onNotificationUpdate={(count) => updateNotifications('story', count)}
              />
            ) : activeTab === 'notes' ? (
              <NotesCategoriesList
                onSelectCategory={(categoryId) => {
                  // Tutaj można dodać logikę przełączania do edycji notatek
                  console.log('Wybrano kategorię:', categoryId);
                }}
                currentUser={currentUser}
                onNotificationUpdate={(count) => updateNotifications('notes', count)}
              />
            ) : (
              <QuestMap
                currentUser={currentUser}
                onNotificationUpdate={(count) => updateNotifications('projects', count)}
              />
            )}
  
              {/* Chat Panel */}
              <ChatPanel
                currentUser={currentUser}
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
              />
  
              {/* Notes Panel */}
              <NotesPanel
                isOpen={isNotesOpen}
                onToggle={() => setIsNotesOpen(!isNotesOpen)}
                currentUser={currentUser}
              />
            </div>
          )}
        </div>
      </AuthProvider>
    );
  }

export default App;
