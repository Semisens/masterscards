import type { Scoring } from '../data/types.ts'

/** Un joueur de la partie en cours et son score (trios gagnés, jetons…). */
export interface Player {
  name: string
  score: number
}

export interface Session {
  players: Player[]
  /** Manche en cours, à partir de 1. Sert aux jeux à manches ; vaut 1 pour les autres. */
  round: number
  /**
   * Vrai quand personne n'a donné de prénom (« Passer cette étape ») : les joueurs ont des noms par défaut
   * (« Joueur 1 »…). La partie n'affiche pas les jetons et demande les prénoms avant de noter les scores.
   */
  unnamed?: true
}

export const MAX_SCORE = 99
export const MAX_ROUND = 99

/** Clé de stockage de la partie d'un jeu. */
export const sessionKey = (gameId: string) => `session:${gameId}`

const isCount = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max

/**
 * Relit une partie mémorisée. Renvoie `null` si le texte est absent ou n'a pas la bonne forme :
 * une donnée abîmée ne doit jamais empêcher l'app de démarrer. L'ancien format (`trios`, sans manche) est accepté.
 */
export function parseSession(raw: string | null): Session | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null || !Array.isArray((data as { players?: unknown }).players))
      return null
    const { players, round, unnamed } = data as { players: unknown[]; round?: unknown; unnamed?: unknown }
    if (players.length === 0) return null
    const valid: Player[] = []
    for (const item of players) {
      if (typeof item !== 'object' || item === null) return null
      const { name, score, trios } = item as { name?: unknown; score?: unknown; trios?: unknown }
      const value = score ?? trios
      if (typeof name !== 'string' || name.trim() === '') return null
      if (!isCount(value, MAX_SCORE)) return null
      valid.push({ name, score: value })
    }
    if (round !== undefined && (!isCount(round, MAX_ROUND) || round < 1)) return null
    return { players: valid, round: round ?? 1, ...(unnamed === true ? { unnamed: true as const } : {}) }
  } catch {
    return null
  }
}

/**
 * Nouvelle partie : tous les joueurs à zéro, première manche. Les noms vides reçoivent un nom par défaut ;
 * si tous sont vides, la partie est « sans prénoms » (`unnamed`).
 */
export function newSession(names: string[], defaultName: (n: number) => string): Session {
  const unnamed = names.every((name) => name.trim() === '')
  return {
    players: names.map((name, i) => ({ name: name.trim() || defaultName(i + 1), score: 0 })),
    round: 1,
    ...(unnamed ? { unnamed: true as const } : {}),
  }
}

/** Points à atteindre pour gagner avec ce nombre de joueurs, ou `undefined` si le jeu n'a pas de fin automatique. */
export function winTarget(scoring: Scoring, playerCount: number): number | undefined {
  const { target } = scoring
  return typeof target === 'number' ? target : target?.[String(playerCount)]
}

/** Vrai si un joueur a atteint le score qui fait gagner la partie. */
export function hasWinner(session: Session, scoring: Scoring): boolean {
  const target = winTarget(scoring, session.players.length)
  return target !== undefined && session.players.some((player) => player.score >= target)
}

/** Fin de manche : ajoute les points gagnés à chacun (sans dépasser le maximum) et passe à la manche suivante. */
export function endRound(session: Session, gains: number[]): Session {
  return {
    ...session,
    players: session.players.map((player, i) => ({
      ...player,
      score: Math.min(MAX_SCORE, player.score + (gains[i] ?? 0)),
    })),
    round: Math.min(MAX_ROUND, session.round + 1),
  }
}

export interface RankedPlayer extends Player {
  /** 1 pour le premier. Deux joueurs à égalité ont le même rang. */
  rank: number
}

/**
 * Classement par score décroissant, ou croissant si le plus petit score gagne (`lowestWins`, 6 qui prend).
 * Les égalités gardent l'ordre de la partie et partagent le même rang.
 */
export function rankPlayers(players: Player[], lowestWins = false): RankedPlayer[] {
  const sorted = [...players].sort((a, b) => (lowestWins ? a.score - b.score : b.score - a.score))
  let rank = 0
  return sorted.map((player, i) => {
    if (i === 0 || player.score !== sorted[i - 1].score) rank = i + 1
    return { ...player, rank }
  })
}
