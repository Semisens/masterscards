import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { fill } from '../src/core/format.ts'
import { loadGame } from '../src/data/loadGame.ts'
import type { Game, GameConfig } from '../src/data/types.ts'
import { winTarget } from '../src/state/session.ts'

// Les jeux de l'app, lus dans src/content/games/<id>/game.yaml comme le fait l'app. Les tests qui les parcourent
// couvrent ainsi tout nouveau jeu, sans qu'on ait à le nommer ici.
const DIR = 'src/content/games'

export const GAMES: Game[] = readdirSync(DIR)
  .filter((id) => existsSync(`${DIR}/${id}/game.yaml`))
  .map((id) => loadGame(parse(readFileSync(`${DIR}/${id}/game.yaml`, 'utf8')) as GameConfig))

const NAMES = ['Léa', 'Tom', 'Inès', 'Sam', 'Maé', 'Noé', 'Lou', 'Max', 'Zoé', 'Eli', 'Ana', 'Jo']

export interface Party {
  players: Array<{ name: string; score: number }>
  round: number
  /** Partie lancée avec « Passer cette étape » : sans prénoms, sans jetons. */
  unnamed?: true
}

/** Une partie en cours de `count` joueurs, en manche 3, avec des scores sous le score visé. */
export function party(count: number): Party {
  return { players: NAMES.slice(0, count).map((name, i) => ({ name, score: i === 0 ? 1 : 0 })), round: 3 }
}

/** Une partie lancée sans prénoms (noms par défaut), de `count` joueurs. */
export function unnamedParty(count: number): Party {
  return {
    players: Array.from({ length: count }, (_, i) => ({ name: `Joueur ${i + 1}`, score: 0 })),
    round: 1,
    unnamed: true,
  }
}

/** Les `count` premiers prénoms de test. */
export const namesOf = (count: number) => NAMES.slice(0, count)

/**
 * Toutes les nouveautés vues (liste JSON de leurs `id`, src/content/changelog.yaml) : à mettre dans
 * `masterscards:news-seen` pour qu'aucune popup ne recouvre l'écran testé.
 */
export const NEWS_SEEN = JSON.stringify(
  (parse(readFileSync('src/content/changelog.yaml', 'utf8')) as Array<{ id: string }>).map((note) => note.id),
)

export { fill, winTarget }
