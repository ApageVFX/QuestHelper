import React, { useState, useEffect } from 'react';
import type { NotesCategory } from '../types';
import './NotesCategoriesList.css';

interface NotesCategoriesListProps {
  onSelectCategory: (categoryId: string) => void;
  currentUser: any;
  onNotificationUpdate?: (count: number) => void;
}

export const NotesCategoriesList: React.FC<NotesCategoriesListProps> = ({ onSelectCategory, onNotificationUpdate }) => {
  const [categories, setCategories] = useState<Record<string, NotesCategory>>({});

  // Ładuj kategorie notatek z localStorage przy montowaniu komponentu
  useEffect(() => {
    const savedCategories = localStorage.getItem('questhelper-notes-categories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        // Konwertuj daty z string na Date objects
        Object.values(parsedCategories).forEach((category: any) => {
          category.lastModified = new Date(category.lastModified);
        });
        setCategories(parsedCategories);
      } catch (error) {
        console.error('Błąd ładowania kategorii notatek z localStorage:', error);
        setDefaultCategories();
      }
    } else {
      setDefaultCategories();
    }

    // Dla powiadomień - zawsze 0 w trybie localStorage
    if (onNotificationUpdate) {
      onNotificationUpdate(0);
    }
  }, [onNotificationUpdate]);

  const setDefaultCategories = () => {
    const defaultCategories: Record<string, NotesCategory> = {
      'nc1': {
        id: 'nc1',
        name: 'Notatki główne',
        description: 'Główne notatki i pomysły projektu',
        noteCount: 0,
        lastModified: new Date(),
        color: '#3498db'
      }
    };
    setCategories(defaultCategories);
  };

  // Zapisz kategorie w localStorage
  const saveCategories = (updatedCategories: Record<string, NotesCategory>) => {
    localStorage.setItem('questhelper-notes-categories', JSON.stringify(updatedCategories));
  };

  // Dodaj nową kategorię
  const addNewCategory = () => {
    const newId = `nc${Date.now()}`;
    const newCategory: NotesCategory = {
      id: newId,
      name: 'Nowa kategoria',
      description: 'Opis nowej kategorii notatek',
      noteCount: 0,
      lastModified: new Date(),
      color: '#34495e'
    };

    const updatedCategories = { ...categories, [newId]: newCategory };
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  };

  // Automatyczne zapisywanie przy każdej zmianie
  useEffect(() => {
    if (Object.keys(categories).length > 0) {
      saveCategories(categories);
    }
  }, [categories]);

  return (
    <div className="notes-categories-container">
      <div className="notes-categories-header">
        <h2>Kategorie notatek</h2>
        <button className="add-category-btn" onClick={addNewCategory}>+ Nowa kategoria</button>
      </div>

      <div className="notes-categories-grid">
        {Object.values(categories).map(category => (
          <div
            key={category.id}
            className="notes-category-card"
            onClick={() => onSelectCategory(category.id)}
            style={{ borderLeftColor: category.color }}
          >
            <div className="category-id">#{category.id}</div>
            <div className="notes-category-card-header">
              <h3>{category.name}</h3>
              <span className="note-count">{category.noteCount} notatek</span>
            </div>
            <p className="notes-category-description">{category.description}</p>
            <div className="notes-category-meta">
              <span className="last-modified">
                Ostatnia zmiana: {category.lastModified.toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesCategoriesList;