import { notFound } from 'next/navigation';
import { MotusGame } from '@/app/games/motus/components/MotusGame';
import { WorldleGame } from '@/app/games/worldle/components/WorldleGame';
import { WikiEraGame } from '@/app/games/wikiera/components/WikiEraGame';
import { PasswordGame } from '@/app/games/password/components/PasswordGame';
import { CemantixGame } from '@/app/games/cemantix/components/CemantixGame';

/**
 * Page unique pour tous les jeux solo. Le slug de l'URL choisit le composant
 * de jeu. Pas de room, pas de token, pas de WebSocket : chaque jeu gère son
 * état via localStorage.
 */
export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  switch (slug) {
    case 'motus':
      return <MotusGame />;
    case 'worldle':
      return <WorldleGame />;
    case 'wikiera':
      return <WikiEraGame />;
    case 'password':
      return <PasswordGame />;
    case 'cemantix':
      return <CemantixGame />;
    default:
      notFound();
  }
}
