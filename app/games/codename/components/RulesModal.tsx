'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 poki-panel p-6 max-w-2xl max-h-[85vh] overflow-y-auto my-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-xl text-purple-400 hover:text-pink-400 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold poki-title mb-4">
              📖 Règles du Codename du CEO
            </h2>

            <div className="space-y-4 text-purple-200/80">
              <section>
                <h3 className="text-lg font-bold text-red-400 mb-2">🎯 Objectif</h3>
                <p>
                  Deux équipes s'affrontent. Chaque équipe doit retrouver tous ses agents
                  (mots) avant l'équipe adverse, en se basant sur les indices donnés par
                  leur Maître-Espion.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-blue-400 mb-2">👥 Rôles</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong className="text-pink-400">Maître-Espion (🔮)</strong> : Voit toutes les couleurs. Donne
                    un indice d'un seul mot + un nombre.
                  </li>
                  <li>
                    <strong className="text-pink-400">Agent (🎯)</strong> : Ne voit que les mots. Devine les cartes
                    de son équipe.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-2">🔄 Tour de jeu</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Le Maître-Espion donne un indice (mot + nombre)</li>
                  <li>Les Agents devinent les cartes (nombre + 1 essais max)</li>
                  <li>Si bonne réponse : continuez à deviner</li>
                  <li>Si mauvaise couleur ou neutre : fin du tour</li>
                  <li>Les Agents peuvent "passer" pour finir leur tour</li>
                </ol>
              </section>

              <section>
                <h3 className="text-lg font-bold text-pink-400 mb-2">🎨 Les cartes</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                    9 cartes rouges (équipe rouge)
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                    8 cartes bleues (équipe bleue)
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 bg-stone-400 rounded-full mr-1"></span>
                    7 cartes neutres (fin de tour)
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 bg-gray-900 border border-gray-600 rounded-full mr-1"></span>
                    1 Assassin 💀 (défaite immédiate !)
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-green-400 mb-2">🏆 Victoire</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Trouvez tous vos agents en premier !</li>
                  <li>Évitez l'Assassin à tout prix (défaite immédiate)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">💡 Conseils</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>L'indice doit être un seul mot</li>
                  <li>L'indice ne peut pas être un mot du plateau</li>
                  <li>0 = essais illimités (jusqu'à erreur)</li>
                  <li>Communiquez avec votre équipe !</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="poki-btn-primary px-6 py-2 font-bold"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="poki-btn-secondary px-3 py-1.5 text-sm"
      >
        📖 Règles
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
