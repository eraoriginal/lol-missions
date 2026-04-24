'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AC,
  AC_CLIP,
  AcAlert,
  AcCard,
  AcGlyph,
  AcSectionNum,
} from '@/app/components/arcane';

interface Category {
  name: string;
  count: number;
}

interface CategorySelectorProps {
  roomCode: string;
  isCreator: boolean;
  selectedCategories: string[];
}

export function CategorySelector({
  roomCode,
  isCreator,
  selectedCategories: initialSelected,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultWordCount, setDefaultWordCount] = useState(0);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/codename/${roomCode}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.availableCategories);
        setDefaultWordCount(data.defaultWordCount || 0);

        if (
          isCreator &&
          data.selectedCategories.length === 0 &&
          data.availableCategories.length > 0
        ) {
          const allCategoryNames = data.availableCategories.map(
            (c: { name: string }) => c.name,
          );
          autoSelectAllCategories(allCategoryNames);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

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
      ? selected.filter((c) => c !== category)
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
      setSelected(selected);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AcCard fold={false} dashed style={{ padding: 14 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            color: AC.bone2,
          }}
        >
          {'// chargement des catégories...'}
        </span>
      </AcCard>
    );
  }

  const selectedCategoryWords =
    selected.length > 0
      ? categories
          .filter((c) => selected.includes(c.name))
          .reduce((sum, c) => sum + c.count, 0)
      : 0;
  const totalWords = defaultWordCount + selectedCategoryWords;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <AcSectionNum n={'CAT'} />
        <h3
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          CATÉGORIES BONUS
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              color: AC.bone2,
              marginLeft: 10,
              textTransform: 'none',
              letterSpacing: '0.18em',
            }}
          >
            {'// '}
            {totalWords} mots
          </span>
        </h3>
      </div>
      <AcCard fold={false} dashed style={{ padding: 16 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.chem,
            marginBottom: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {'> '}
          {defaultWordCount} mots de base toujours inclus
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.bone2,
            marginBottom: 14,
            lineHeight: 1.55,
          }}
        >
          {isCreator
            ? '// ajoute des catégories pour enrichir le plateau'
            : '// le créateur sélectionne les catégories bonus'}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selected.includes(category.name);
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => toggleCategory(category.name)}
                disabled={!isCreator || updating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: isSelected
                    ? 'rgba(255,61,139,0.15)'
                    : 'rgba(240,228,193,0.03)',
                  border: isSelected
                    ? `2px solid ${AC.shimmer}`
                    : `1.5px dashed ${AC.bone2}`,
                  clipPath: AC_CLIP,
                  cursor: isCreator ? 'pointer' : 'default',
                  opacity: updating ? 0.6 : 1,
                  color: isSelected ? AC.bone : AC.bone2,
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {isSelected && (
                  <AcGlyph kind="check" color={AC.shimmer} size={12} stroke={2.5} />
                )}
                {category.name}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 10,
                    color: isSelected ? AC.shimmer : AC.bone2,
                    marginLeft: 2,
                  }}
                >
                  ({category.count})
                </span>
              </button>
            );
          })}
        </div>

        {totalWords < 25 && (
          <div className="mt-3">
            <AcAlert tone="danger" tape="// WARN">
              <span style={{ color: AC.bone }}>
                {'// il faut au moins 25 mots pour générer un plateau'}
              </span>
            </AcAlert>
          </div>
        )}
      </AcCard>
    </div>
  );
}
