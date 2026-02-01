'use client';

import { useState, useEffect } from 'react';

interface Category {
  name: string;
  count: number;
}

interface CategorySelectorProps {
  roomCode: string;
  isCreator: boolean;
  selectedCategories: string[];
}

export function CategorySelector({ roomCode, isCreator, selectedCategories: initialSelected }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultWordCount, setDefaultWordCount] = useState(0);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [roomCode]);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/games/codename/${roomCode}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.availableCategories);
        setDefaultWordCount(data.defaultWordCount || 0);

        // Auto-select all categories if none are selected yet and user is creator
        if (isCreator && data.selectedCategories.length === 0 && data.availableCategories.length > 0) {
          const allCategoryNames = data.availableCategories.map((c: { name: string }) => c.name);
          autoSelectAllCategories(allCategoryNames);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoSelectAllCategories = async (categoryNames: string[]) => {
    try {
      const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
      await fetch(`/api/games/codename/${roomCode}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, categories: categoryNames }),
      });
      setSelected(categoryNames);
    } catch (err) {
      console.error('Error auto-selecting categories:', err);
    }
  };

  const toggleCategory = async (category: string) => {
    if (!isCreator || updating) return;

    const newSelected = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category];

    setUpdating(true);
    setSelected(newSelected);

    try {
      const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
      await fetch(`/api/games/codename/${roomCode}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, categories: newSelected }),
      });
    } catch (err) {
      console.error('Error updating categories:', err);
      setSelected(selected); // Revert on error
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="poki-panel p-4 text-center">
        <p className="text-purple-300/70">Chargement des catégories...</p>
      </div>
    );
  }

  // Calculate total words: default words + selected category words
  const selectedCategoryWords = selected.length > 0
    ? categories.filter(c => selected.includes(c.name)).reduce((sum, c) => sum + c.count, 0)
    : 0;
  const totalWords = defaultWordCount + selectedCategoryWords;

  return (
    <div className="poki-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold poki-title flex items-center gap-2">
          <span>🏷️</span> Catégories bonus
        </h3>
        <span className="text-sm text-purple-300/70">
          {totalWords} mots disponibles
        </span>
      </div>

      {/* Default words info */}
      <div className="mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-sm text-purple-300/80">
          <span className="text-green-400">✓</span> {defaultWordCount} mots de base toujours inclus
        </p>
      </div>

      {isCreator ? (
        <p className="text-sm text-purple-300/60 mb-3">
          Ajoute des catégories pour enrichir le plateau avec des mots thématiques
        </p>
      ) : (
        <p className="text-sm text-purple-300/60 mb-3">
          Le créateur sélectionne les catégories bonus
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category.name);
          return (
            <button
              key={category.name}
              onClick={() => toggleCategory(category.name)}
              disabled={!isCreator || updating}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }
                ${isCreator ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                ${updating ? 'opacity-50' : ''}
              `}
            >
              {category.name}
              <span className={`ml-1.5 text-xs ${isSelected ? 'text-pink-200' : 'text-purple-400'}`}>
                ({category.count})
              </span>
            </button>
          );
        })}
      </div>

      {totalWords < 25 && (
        <p className="mt-3 text-sm text-red-400">
          ⚠️ Il faut au moins 25 mots pour générer un plateau
        </p>
      )}
    </div>
  );
}
