import changelog from '../content/changelog.yaml'

// Notes de nouveautés (src/content/changelog.yaml), la plus récente en haut. Validées par src/data/news.test.ts.
// Jeremy choisit, note par note, si elle s'affiche au lancement (`popup`, une fois par utilisateur) et si elle est
// disponible dans Réglages → Nouveautés (`listed`). Aucun lien avec les numéros de version.

/** Nombre maximum de notes montrées d'un coup au lancement. */
export const MAX_PENDING = 5

export interface NewsNote {
  /** Identifiant unique (minuscules et tirets) : l'app retient les notes vues par leur `id`. */
  id: string
  /** Vrai : s'affiche au lancement, une fois par utilisateur. Faux : plus jamais en popup. */
  popup: boolean
  /** Vrai : disponible dans Réglages → Nouveautés. */
  listed: boolean
  title: string
  text: string
  items?: string[]
  /** Id d'un jeu : sa vignette et « Voir le jeu ». */
  game?: string
}

/** Notes telles qu'écrites dans le fichier, la plus récente d'abord. */
export const newsNotes: NewsNote[] = Array.isArray(changelog) ? (changelog as NewsNote[]) : []

/** Réglages → Nouveautés : les notes disponibles, dans l'ordre du fichier (la plus récente d'abord). */
export const listedNotes = (notes: NewsNote[]): NewsNote[] => notes.filter((note) => note.listed)

/** Au lancement : les notes `popup` pas encore vues, dans l'ordre du fichier, 5 au plus. */
export function pendingNotes(notes: NewsNote[], seen: readonly string[]): NewsNote[] {
  return notes.filter((note) => note.popup && !seen.includes(note.id)).slice(0, MAX_PENDING)
}

/** Les `id` vus, relus du stockage : une liste JSON ; toute autre valeur (ancien numéro de version) vaut aucune. */
export function parseSeen(raw: string | null): string[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}
