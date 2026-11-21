import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState/EmptyState.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { getGame } from '../../data/games.ts'
import type { Game } from '../../data/types.ts'
import { fr } from '../../i18n/fr.ts'
import { summary, type HistoryEntry } from '../../state/history.ts'
import { useHistory } from '../../state/useHistory.ts'
import styles from './HistoryPage.module.css'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

interface Group {
  game: Game
  entries: HistoryEntry[]
}

/** Regroupe les parties par jeu, dans l'ordre où les jeux apparaissent (le plus récemment joué d'abord). */
function groupByGame(entries: HistoryEntry[]): Group[] {
  const groups = new Map<string, Group>()
  for (const entry of entries) {
    const game = getGame(entry.gameId)
    if (!game) continue
    const group = groups.get(game.id) ?? { game, entries: [] }
    group.entries.push(entry)
    groups.set(game.id, group)
  }
  return [...groups.values()]
}

/** « Tes scores » : les parties passées, par jeu. Un jeu est ouvert à la fois ; le plus récent l'est au départ. */
export function HistoryPage() {
  const { status, entries } = useHistory()
  const [chosen, setChosen] = useState<string | null>(null)
  if (status === 'loading') return <Screen tabs>{null}</Screen>

  const groups = groupByGame(entries)
  const openId = chosen ?? groups[0]?.game.id

  return (
    <Screen tabs>
      <PageTitle>{fr.history.title}</PageTitle>
      {groups.length === 0 ? (
        <EmptyState title={fr.history.emptyTitle} text={fr.history.emptyText} />
      ) : (
        <div className={styles.list}>
          {groups.map(({ game, entries: parties }) => {
            const open = game.id === openId
            const panelId = `history-${game.id}`
            return (
              <Panel key={game.id}>
                <button
                  type="button"
                  className={styles.header}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setChosen(open ? '' : game.id)}
                >
                  <span>{game.name}</span>
                  <span>
                    {fr.history.games(parties.length)}
                    {!open && <span aria-hidden="true"> ›</span>}
                  </span>
                </button>
                {open && (
                  <ul id={panelId} className={styles.parties}>
                    {parties.map((entry) => (
                      <li key={entry.id} className={styles.row}>
                        <span>{dateFormat.format(new Date(entry.date))}</span>
                        <span>{summary(entry, game.scoring.lowest_wins)}</span>
                        <b>
                          <span className={entry.status === 'finished' ? styles.finished : styles.interrupted}>
                            {entry.status === 'finished' ? fr.history.finished : fr.history.interrupted}
                          </span>
                        </b>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )
          })}
        </div>
      )}
    </Screen>
  )
}
