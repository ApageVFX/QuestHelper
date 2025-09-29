import React, { useState } from 'react';
import './LoginModal.css';

// Predefiniowani użytkownicy z indywidualnymi hasłami
const predefinedUsers = {
  'apage@questhelper.com': { name: 'Apage', role: 'designer', password: 'quest123', color: '#e74c3c' },
  'devrena@questhelper.com': { name: 'Devrena', role: 'budowniczy', password: 'pedzel123', color: '#27ae60' },
  'bocik@questhelper.com': { name: 'Bocik', role: 'technik', password: 'plugin123', color: '#f39c12' },
  'warrior1@questhelper.com': { name: 'Warrior1', role: 'edytujący', password: 'warriormc', color: '#3498db' },
  'warrior2@questhelper.com': { name: 'Warrior2', role: 'edytujący', password: 'warriormc', color: '#9b59b6' }
};

interface LoginModalProps {
  onLogin: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUser || !password) {
      setError('Wybierz użytkownika i wprowadź hasło!');
      return;
    }

    // Sprawdź hasło dla wybranego użytkownika
    const userData = predefinedUsers[selectedUser as keyof typeof predefinedUsers];
    if (!userData) {
      setError('Wybrany użytkownik nie istnieje');
      return;
    }
    if (password !== userData.password) {
      setError('Nieprawidłowe hasło');
      return;
    }

    // Symuluj logowanie - utwórz dane użytkownika lokalnie
    const finalUserData = {
      name: userData.name,
      role: userData.role,
      color: userData.color,
      email: selectedUser,
      uid: `local_${selectedUser.replace('@', '_').replace('.', '_')}_${Date.now()}`,
      createdAt: new Date()
    };

    // Zapisz informacje o zalogowanym użytkowniku w localStorage
    localStorage.setItem('currentUser', JSON.stringify(finalUserData));

    setError('');
    onLogin(finalUserData);
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <h2>Logowanie do Quest Line Editor</h2>
        <p>Wybierz użytkownika z listy i wprowadź odpowiednie hasło</p>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="user-select"
        >
          <option value="">Wybierz użytkownika</option>
          {Object.entries(predefinedUsers).map(([email, user]) => (
            <option key={email} value={email}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password-input"
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleLogin} className="login-btn">
          Zaloguj się
        </button>

        <div className="login-info">
          <p><strong>Dostępni użytkownicy:</strong></p>
          <ul>
            {Object.entries(predefinedUsers).map(([email, user]) => (
              <li key={email}>
                <strong>{user.name}</strong> - {user.role}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;