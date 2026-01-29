import { CreateRoomForm } from './components/CreateRoomForm';
import { JoinRoomForm } from './components/JoinRoomForm';

export default function Home() {
  return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-6xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🎮 LOL ARAM Missions
            </h1>
            <p className="text-xl text-gray-300">
              Ajoute du fun à tes parties ARAM avec des missions aléatoires !
            </p>
          </div>

          {/* Forms Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Room */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Créer une room
              </h2>
              <p className="text-gray-600 mb-6">
                Lance une nouvelle partie avec tes amis
              </p>
              <CreateRoomForm />
            </div>

            {/* Join Room */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Rejoindre une room
              </h2>
              <p className="text-gray-600 mb-6">
                Entre le code partagé par ton ami
              </p>
              <JoinRoomForm />
            </div>
          </div>

          {/* How it works */}
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Comment ça marche ?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-semibold mb-2">Crée une room</h4>
                <p className="text-sm text-gray-300">
                  Le créateur lance la room et partage le code
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-semibold mb-2">Invitez vos amis</h4>
                <p className="text-sm text-gray-300">
                  Jusqu'à 10 joueurs peuvent rejoindre
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-semibold mb-2">Lancez la game !</h4>
                <p className="text-sm text-gray-300">
                  Chaque joueur reçoit sa mission secrète
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}