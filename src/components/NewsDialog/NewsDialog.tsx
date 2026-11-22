import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useSwipe } from '../../core/useSwipe.ts'
import { getGame } from '../../data/games.ts'
import type { NewsNote } from '../../data/news.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { Button } from '../Button/Button.tsx'
import { ButtonLink } from '../Button/ButtonLink.tsx'
import { GameTile } from '../GameTile/GameTile.tsx'
import styles from './NewsDialog.module.css'

export interface NewsDialogProps {
  /** Notes à montrer, la plus récente d'abord. */
  notes: NewsNote[]
  /** Fermeture (×, Échap, « C'est compris », ou un jeu ouvert). */
  onClose: () => void
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Popup des nouveautés : une note par écran, à balayer s'il y en a plusieurs (points et chevrons, comme la vue
 * à balayer des cartes). Une note liée à un jeu montre sa vignette et « Voir le jeu ».
 */
export function NewsDialog({ notes, onClose }: NewsDialogProps) {
  const [index, setIndex] = useState(0)
  const dialog = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // Le focus entre dans la popup à l'ouverture et revient d'où il venait à la fermeture.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.current?.focus()
    return () => previous?.focus()
  }, [])

  const goTo = (target: number) => {
    if (target >= 0 && target < notes.length) setIndex(target)
  }
  const swipe = useSwipe({ onNext: () => goTo(index + 1), onPrevious: () => goTo(index - 1) })

  const note = notes[Math.min(index, notes.length - 1)]
  if (!note) return null
  const game = note.game ? getGame(note.game) : undefined
  const isLast = index >= notes.length - 1
  const several = notes.length > 1

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    // Le focus reste dans la popup.
    if (event.key === 'Tab' && dialog.current) {
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
      return
    }
    if (several) swipe.onKeyDown(event)
  }

  return (
    <div className={styles.overlay}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
        onKeyDown={onKeyDown}
      >
        <div className={styles.header}>
          <p className={styles.kicker}>{fr.news.title}</p>
          <button type="button" className={styles.close} aria-label={fr.news.close} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <h2 id={titleId} className={styles.title}>
            {note.title}
          </h2>
          <p>{note.text}</p>
          {note.items && note.items.length > 0 && (
            <ul className={styles.items}>
              {note.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {game && (
            // La vignette ouvre le jeu : la popup se ferme et la note est vue.
            <div className={styles.tile} onClickCapture={onClose}>
              <GameTile game={game} />
            </div>
          )}
        </div>

        {several && (
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.chevron}
              aria-label={fr.news.previous}
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              ‹
            </button>
            <div className={styles.dots} role="img" aria-label={fr.news.counter(index + 1, notes.length)}>
              {notes.map((n, i) => (
                <span key={n.id} className={i === index ? styles.dotActive : styles.dot} />
              ))}
            </div>
            <button
              type="button"
              className={styles.chevron}
              aria-label={fr.news.next}
              disabled={isLast}
              onClick={() => goTo(index + 1)}
            >
              ›
            </button>
          </div>
        )}

        <div className={styles.actions}>
          {game && (
            <ButtonLink block variant="ciel" to={paths.game(game.id)} onClick={onClose}>
              {fr.news.seeGame}
            </ButtonLink>
          )}
          <Button block onClick={() => (isLast ? onClose() : goTo(index + 1))}>
            {isLast ? fr.news.done : fr.nav.next}
          </Button>
        </div>
      </div>
    </div>
  )
}
