import { CreateRoomForm } from './components/CreateRoomForm';
import { JoinRoomForm } from './components/JoinRoomForm';

export default function Home() {
  return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-6xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🎮 Le bureau du Mari de Poki
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 drop-shadow-md">
              Des mini-jeux fun pour animer vos soirées entre amis !
            </p>
          </div>

          {/* Forms Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Create Room */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-white/20 hover:shadow-3xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Créer une room
                  </h2>
                  <p className="text-sm text-gray-500">
                    Lance une nouvelle partie
                  </p>
                </div>
              </div>
              <CreateRoomForm />
            </div>

            {/* Join Room */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-white/20 hover:shadow-3xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Rejoindre une room
                  </h2>
                  <p className="text-sm text-gray-500">
                    Entre le code de ton ami
                  </p>
                </div>
              </div>
              <JoinRoomForm />
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              💡 Comment ça marche ?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Étape 1 */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform">
                  1
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Choisis ton jeu</h4>
                <p className="text-gray-200 leading-relaxed">
                  Sélectionne parmi plusieurs mini-jeux disponibles et crée ta room
                </p>
              </div>

              {/* Étape 2 */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform">
                  2
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Invite tes amis</h4>
                <p className="text-gray-200 leading-relaxed">
                  Partage le code de la room avec tes amis (jusqu'à 10 joueurs)
                </p>
              </div>

              {/* Étape 3 */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform">
                  3
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Amusez-vous !</h4>
                <p className="text-gray-200 leading-relaxed">
                  Lancez la partie et profitez d'un moment fun entre amis
                </p>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid md:grid-cols-2 gap-6 text-white">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h5 className="font-semibold mb-1">ARAM Missions</h5>
                    <p className="text-sm text-gray-300">Missions secrètes pour pimenter vos parties League of Legends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🕵️</span>
                  <div>
                    <h5 className="font-semibold mb-1">Codename du CEO</h5>
                    <p className="text-sm text-gray-300">Jeu d'équipe inspiré de Codenames avec thème LoL</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☕</span>
                  <div>
                    <h5 className="font-semibold mb-1">Quiz de la salle de pause</h5>
                    <p className="text-sm text-gray-300">Questions amusantes entre collègues (bientôt disponible)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h5 className="font-semibold mb-1">Et plus encore !</h5>
                    <p className="text-sm text-gray-300">De nouveaux jeux arrivent régulièrement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}