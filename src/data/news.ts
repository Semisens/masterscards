import changelog from '../content/changelog.yaml'

// Notes de nouveautés (src/content/changelog.yaml), la plus récente en haut. Validées par src/data/news.test.ts.

/** Note pas encore publiée : `npm version` y écrit le numéro (scripts/stamp-changelog.ts). */
export const NEXT_VERSION = 'prochaine'

/** Nombre maximum de notes montrées d'un coup au démarrage. */
export const MAX_PENDING = 5

export interface NewsNote {
  /** `x.y.z`, ou `prochaine` avant la publication. */
  version: string
  title: string
  text: string
  items?: string[]
  /** Id d'un jeu : sa vignette et « Voir le jeu ». */
  game?: string
}

/** Notes telles qu'écrites dans le fichier (pour les tests). */
export const newsNotes: NewsNote[] = Array.isArray(changelog) ? (changelog as NewsNote[]) : []

const parts = (version: string) => version.split('.').map((n) => Number.parseInt(n, 10) || 0)

/** Compare deux versions `x.y.z` : négatif si `a` est plus ancienne, 0 si égales, positif sinon. */
export function compareVersions(a: string, b: string): number {
  const [pa, pb] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** Une note pas encore publiée vaut la version en cours : on la voit en développement avant de publier. */
export function resolveNotes(notes: NewsNote[], current: string): NewsNote[] {
  return notes.map((note) => (note.version === NEXT_VERSION ? { ...note, version: current } : note))
}

/** Toutes les notes jusqu'à la version en cours, la plus récente d'abord (Réglages → Nouveautés). */
export function publishedNotes(notes: NewsNote[], current: string): NewsNote[] {
  return resolveNotes(notes, current)
    .filter((note) => compareVersions(note.version, current) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version))
}

/** Notes pas encore vues : plus récentes que `seen`, jusqu'à la version en cours, la plus récente d'abord. */
export function pendingNotes(notes: NewsNote[], current: string, seen: string): NewsNote[] {
  return publishedNotes(notes, current)
    .filter((note) => compareVersions(note.version, seen) > 0)
    .slice(0, MAX_PENDING)
}
