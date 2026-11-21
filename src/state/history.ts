import { MAX_SCORE, type Player } from './session.ts'

export type GameStatus = 'finished' | 'interrupted'

/** Une partie passée : terminée (quelqu'un a gagné) ou interrompue (on a arrêté avant). */
export interface HistoryEntry {
  /** Identifiant unique : l'instant de fin, en millisecondes. */
  id: string
  gameId: string
  /** Date de fin, au format ISO. */
  date: string
  status: GameStatus
  players: Player[]
}

export const HISTORY_KEY = 'history'
/** On garde les parties les plus récentes : l'historique ne grossit pas sans fin. */
export const MAX_HISTORY = 100

const isPlayer = (item: unknown): item is Player => {
  if (typeof item !== 'object' || item === null) return false
  const { name, score } = item as { name?: unknown; score?: unknown }
  return (
    typeof name === 'string' &&
    name.trim() !== '' &&
    typeof score === 'number' &&
    Number.isInteger(score) &&
    score >= 0 &&
    score <= MAX_SCORE
  )
}

const isEntry = (item: unknown): item is HistoryEntry => {
  if (typeof item !== 'object' || item === null) return false
  const { id, gameId, date, status, players } = item as Record<string, unknown>
  return (
    typeof id === 'string' &&
    typeof gameId === 'string' &&
    typeof date === 'string' &&
    !Number.isNaN(Date.parse(date)) &&
    (status === 'finished' || status === 'interrupted') &&
    Array.isArray(players) &&
    players.length > 0 &&
    players.every(isPlayer)
  )
}

/** Relit l'historique. Les entrées abîmées sont ignorées une à une ; un texte invalide donne une liste vide. */
export function parseHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) ? data.filter(isEntry) : []
  } catch {
    return []
  }
}

/** Ajoute une partie en tête (la plus récente d'abord) et coupe la liste à `MAX_HISTORY`. */
export function withEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...history.filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY)
}

/** Résumé court d'une partie : les deux meilleurs, « Léa 4 · Tom 2 » (les deux plus petits scores si `lowestWins`). */
export function summary(entry: HistoryEntry, lowestWins = false): string {
  return [...entry.players]
    .sort((a, b) => (lowestWins ? a.score - b.score : b.score - a.score))
    .slice(0, 2)
    .map((player) => `${player.name} ${player.score}`)
    .join(' · ')
}
