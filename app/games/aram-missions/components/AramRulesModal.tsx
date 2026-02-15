'use client';

import { useState } from 'react';

export function AramRulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lol-button px-3 py-1.5 rounded-lg text-sm"
      >
        📜 Règles
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative lol-card rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto lol-scrollbar">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-xl lol-text hover:lol-text-gold transition-colors cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold lol-title-gold mb-4">
              📜 Règles du combat ARAM
            </h2>

            <div className="space-y-5 lol-text">
              <section>
                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                  <span>⚔️</span> Équipes
                </h3>
                <p className="leading-relaxed">
                  Choisissez l&apos;équipe Rouge ou Bleue avant le démarrage. Chaque équipe peut avoir
                  au plus <span className="lol-text-gold font-semibold">5 joueurs</span>.
                  Vous pouvez changer d&apos;équipe ou devenir spectateur à tout moment avant que le créateur
                  ne lance la partie.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <span>📜</span> Missions
                </h3>
                <p className="leading-relaxed mb-3">
                  Chaque invocateur reçoit <span className="lol-text-gold font-semibold">3 missions</span> au fil de la partie :
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="inline-block mt-1.5 w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
                    <p>
                      <span className="font-semibold text-blue-400">Mission Début</span> — Disponible dès que le créateur lance la partie.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-block mt-1.5 w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span>
                    <p>
                      <span className="font-semibold text-purple-400">Mission MID</span> — Apparaît après le délai configuré.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-block mt-1.5 w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
                    <p>
                      <span className="font-semibold text-red-400">Mission Finale</span> — Apparaît en fin de partie.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span>🔒</span> Missions secrètes
                </h3>
                <p className="leading-relaxed">
                  Certaines missions sont <span className="lol-text-gold font-semibold">secrètes</span> : seul l&apos;invocateur concerné voit le texte pendant la partie.
                  Les autres ne voient qu&apos;un bloc flou avec le badge 🔒. Tout est révélé lors de la validation.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
                  <span>💰</span> Points
                </h3>
                <p className="leading-relaxed mb-3">
                  Chaque mission validée rapporte des points selon sa difficulté :
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-b from-green-600 to-green-800 border border-[#C8AA6E]/50 text-[#F0E6D2] text-sm font-semibold px-3 py-1.5 rounded">
                    Facile — 100 pts
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-b from-yellow-600 to-yellow-800 border border-[#C8AA6E]/50 text-[#F0E6D2] text-sm font-semibold px-3 py-1.5 rounded">
                    Moyen — 200 pts
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-b from-red-600 to-red-800 border border-[#C8AA6E]/50 text-[#F0E6D2] text-sm font-semibold px-3 py-1.5 rounded">
                    Difficile — 500 pts
                  </span>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <span>✅</span> Validation
                </h3>
                <p className="leading-relaxed">
                  Quand le créateur arrête le compteur, la <span className="lol-text-gold font-semibold">phase de validation</span> commence.
                  Il vérifie chaque mission invocateur par invocateur, devant tout le monde.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold lol-text-gold mb-2 flex items-center gap-2">
                  <span>🏆</span> Victoire
                </h3>
                <p className="leading-relaxed">
                  À la fin, les points sont additionnés par équipe.
                  L&apos;équipe avec le <span className="lol-text-gold font-semibold">plus grand total</span> remporte la partie !
                </p>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="lol-button-hextech px-6 py-2 rounded-lg font-bold"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
