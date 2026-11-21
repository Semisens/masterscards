import { useCallback, useEffect, useState } from 'react'
import { storage } from '../core/storage.ts'
import { newsNotes, pendingNotes, type NewsNote } from '../data/news.ts'

/** Dernière version dont les nouveautés ont été vues. */
export const NEWS_SEEN_KEY = 'news-seen'
/** Drapeau du mot de bienvenue (HomePage) : présent, l'utilisateur avait déjà l'app. */
const WELCOMED_KEY = 'welcomed'

/**
 * Nouveautés à montrer au démarrage, et de quoi les marquer vues.
 * - Premier lancement (ni nouveautés vues, ni bienvenue) : rien à montrer, la version en cours est notée vue.
 * - Utilisateur d'avant cette fonction (bienvenue vue, nouveautés jamais vues) : toutes les notes en attente.
 * Vaut `[]` tant que le stockage n'a pas répondu : rien ne clignote.
 */
export function useNews(
  notes: NewsNote[] = newsNotes,
  current: string = __APP_VERSION__,
): [pending: NewsNote[], dismiss: () => void] {
  const [pending, setPending] = useState<NewsNote[]>([])

  useEffect(() => {
    let cancelled = false
    void Promise.all([storage.get(NEWS_SEEN_KEY), storage.get(WELCOMED_KEY)]).then(([seen, welcomed]) => {
      if (cancelled) return
      if (seen === null && welcomed !== '1') {
        void storage.set(NEWS_SEEN_KEY, current)
        return
      }
      setPending(pendingNotes(notes, current, seen ?? '0.0.0'))
    })
    return () => {
      cancelled = true
    }
  }, [notes, current])

  const dismiss = useCallback(() => {
    setPending([])
    void storage.set(NEWS_SEEN_KEY, current)
  }, [current])

  return [pending, dismiss]
}
