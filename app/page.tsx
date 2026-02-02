import { CreateRoomForm } from './components/CreateRoomForm';
import { JoinRoomForm } from './components/JoinRoomForm';

export default function Home() {
  return (
    <main className="arcane-bg min-h-screen p-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto py-12 md:py-16 relative z-10">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-light text-purple-100 mb-4 tracking-wide">
            Le bureau du{' '}
            <span className="arcane-title-accent block md:inline">Mari de Poki</span>
          </h1>
          <p className="text-lg text-purple-300/70 tracking-wide">
            Mini-jeux pour vos soirées entre amis
          </p>
        </header>

        {/* Forms Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-16">
          {/* Create Room */}
          <div className="arcane-card p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="arcane-icon w-14 h-14 flex items-center justify-center">
                <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-100">
                  Créer une room
                </h2>
                <p className="text-sm text-purple-300/60">
                  Lance une nouvelle partie
                </p>
              </div>
            </div>
            <CreateRoomForm />
          </div>

          {/* Join Room */}
          <div className="arcane-card p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="arcane-icon-cyan w-14 h-14 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-100">
                  Rejoindre une room
                </h2>
                <p className="text-sm text-purple-300/60">
                  Entre le code de ton ami
                </p>
              </div>
            </div>
            <JoinRoomForm />
          </div>
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h3 className="text-sm font-semibold text-purple-400/80 uppercase tracking-widest text-center mb-10">
            Comment ça marche
          </h3>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="arcane-step arcane-step-pink mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/20 transition-all">
                1
              </div>
              <h4 className="text-base font-semibold text-purple-100 mb-2">Choisis ton jeu</h4>
              <p className="text-sm text-purple-300/60 leading-relaxed">
                Sélectionne parmi les mini-jeux
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="arcane-step arcane-step-gold mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all">
                2
              </div>
              <h4 className="text-base font-semibold text-purple-100 mb-2">Invite tes amis</h4>
              <p className="text-sm text-purple-300/60 leading-relaxed">
                Partage le code de la room
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="arcane-step arcane-step-cyan mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                3
              </div>
              <h4 className="text-base font-semibold text-purple-100 mb-2">Jouez</h4>
              <p className="text-sm text-purple-300/60 leading-relaxed">
                Lancez la partie et amusez-vous
              </p>
            </div>
          </div>
        </section>

        {/* Games list */}
        <section>
          <h3 className="text-sm font-semibold text-purple-400/80 uppercase tracking-widest text-center mb-8">
            Jeux disponibles
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 hover:border-pink-500/30 hover:bg-purple-900/30 transition-all">
              <div className="arcane-step arcane-step-pink w-12 h-12 text-base">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-100">ARAM Missions</h5>
                <p className="text-xs text-purple-300/50">Missions secrètes pour vos parties LoL</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 hover:border-cyan-500/30 hover:bg-purple-900/30 transition-all">
              <div className="arcane-step arcane-step-cyan w-12 h-12 text-base">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-purple-100">Codename du CEO</h5>
                <p className="text-xs text-purple-300/50">Jeu de mots en équipe</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/10 border border-purple-500/10 opacity-50">
              <div className="arcane-step arcane-step-gold w-12 h-12 text-base opacity-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-medium text-purple-300/50">Quiz de la salle de pause</h5>
                <p className="text-xs text-purple-400/30">Bientôt disponible</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/10 border border-purple-500/10 opacity-50">
              <div className="arcane-step arcane-step-green w-12 h-12 text-base opacity-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-medium text-purple-300/50">Plus à venir</h5>
                <p className="text-xs text-purple-400/30">De nouveaux jeux arrivent</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
