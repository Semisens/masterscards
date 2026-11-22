import { useCallback, useEffect, useState } from 'react'
import { storage } from '../core/storage.ts'
import { newsNotes, parseSeen, pendingNotes, type NewsNote } from '../data/news.ts'

/** Les `id` des nouveautés déjà vues (liste JSON). */
export const NEWS_SEEN_KEY = 'news-seen'
/** Drapeau du mot de bienvenue (HomePage) : présent, l'utilisateur avait déjà l'app. */
const WELCOMED_KEY = 'welcomed'

/**
 * Nouveautés à montrer au lancement (`popup: true`, pas encore vues), et de quoi les marquer vues.
 * - Premier lancement (ni nouveautés vues, ni bienvenue) : rien à montrer ; les notes actuelles sont notées vues,
 *   un nouvel utilisateur ne reçoit pas d'anciennes annonces.
 * - Utilisateur existant sans liste (ou avec l'ancien numéro de version) : toutes les notes `popup` en attente.
 * Vaut `[]` tant que le stockage n'a pas répondu : rien ne clignote.
 */
export function useNews(notes: NewsNote[] = newsNotes): [pending: NewsNote[], dismiss: () => void] {
  const [pending, setPending] = useState<NewsNote[]>([])
  const [seen, setSeen] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    void Promise.all([storage.get(NEWS_SEEN_KEY), storage.get(WELCOMED_KEY)]).then(([raw, welcomed]) => {
      if (cancelled) return
      if (raw === null && welcomed !== '1') {
        void storage.set(NEWS_SEEN_KEY, JSON.stringify(notes.filter((note) => note.popup).map((note) => note.id)))
        return
      }
      const ids = parseSeen(raw)
      setSeen(ids)
      setPending(pendingNotes(notes, ids))
    })
    return () => {
      cancelled = true
    }
  }, [notes])

  const dismiss = useCallback(() => {
    const next = [...new Set([...seen, ...pending.map((note) => note.id)])]
    setPending([])
    setSeen(next)
    void storage.set(NEWS_SEEN_KEY, JSON.stringify(next))
  }, [seen, pending])

  return [pending, dismiss]
}
