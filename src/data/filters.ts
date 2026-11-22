import { normalizeText } from '../core/text.ts'
import { deckPlan } from './deck.ts'
import type { Game } from './types.ts'

export type GameFilter = 'all' | 'two' | 'quick' | 'noJoker'

/** Jeu « 2 joueurs » : il se joue à deux (2 est entre son minimum et son maximum). */
export const TWO_PLAYERS = 2
/** Jeu « rapide » : une partie dure 15 minutes ou moins. */
export const QUICK_MAX_MINUTES = 15

const matches: Record<GameFilter, (game: Game) => boolean> = {
  all: () => true,
  two: (game) => game.players.min <= TWO_PLAYERS && game.players.max >= TWO_PLAYERS,
  quick: (game) => game.duration_min <= QUICK_MAX_MINUTES,
  // « Sans joker » : le jeu se joue avec le paquet de 52 seul, aucun joker gardé.
  noJoker: (game) => deckPlan(game).keptJokers === 0,
}

/** Les jeux qui répondent au filtre choisi et contiennent le texte cherché dans leur nom (sans casse ni accents). */
export function filterGames(games: Game[], filter: GameFilter, query: string): Game[] {
  const wanted = normalizeText(query.trim())
  return games.filter((game) => matches[filter](game) && normalizeText(game.name).includes(wanted))
}
