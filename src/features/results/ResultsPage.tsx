import { useParams } from 'react-router'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { isCrowded, rankPlayers } from '../../state/session.ts'
import { useHistory } from '../../state/useHistory.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import styles from './ResultsPage.module.css'

/** Les marches du podium, dans l'ordre d'affichage : le 2e à gauche, le 1er au centre, le 3e à droite. */
const STEPS = [
  { place: 1, className: styles.second },
  { place: 0, className: styles.first },
  { place: 2, className: styles.third },
]

/**
 * Podium d'une partie terminée ou interrompue : les trois premiers sur des marches, les suivants en liste.
 * La partie est lue dans l'historique : elle y a été archivée au moment de la terminer.
 */
export function ResultsPage() {
  const { gameId, partieId } = useParams()
  const game = getGame(gameId)
  const { status, entries } = useHistory()

  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />
  if (status === 'loading') return null
  const entry = entries.find((item) => item.id === partieId && item.gameId === game.id)
  if (!entry) return <NotFoundPage message={fr.results.notFound} />

  const ranked = rankPlayers(entry.players, game.scoring.lowest_wins)
  const steps = STEPS.map(({ place, className }) => ({ player: ranked[place], className })).filter(
    (step) => step.player,
  )
  const others = ranked.slice(3)
  // Beaucoup de joueurs (Loup-garou) : les suivants sur deux colonnes, lignes serrées.
  const crowded = isCrowded(ranked.length)

  return (
    <Screen tight={crowded}>
      <span className={`${styles.status} ${entry.status === 'finished' ? styles.finished : styles.interrupted}`}>
        {entry.status === 'finished' ? fr.results.finished : fr.results.interrupted}
      </span>
      <PageTitle>{fr.results.title}</PageTitle>

      <ol className={styles.podium} aria-label={fr.results.podium}>
        {steps.map(({ player, className }) => (
          <li
            key={className}
            className={styles.column}
            aria-label={`${fr.results.place(player.rank)} : ${player.name}, ${player.score}`}
          >
            {player.name}
            <div className={`${styles.step} ${className}`} aria-hidden="true">
              {player.rank}
            </div>
          </li>
        ))}
      </ol>

      {others.length > 0 && (
        <Panel>
          <div className={crowded ? styles.grid : undefined}>
            {others.map((player, i) => (
              <div key={i} className={styles.row}>
                <span>{fr.results.place(player.rank)}</span>
                <span className={styles.name}>{player.name}</span>
                <b>{player.score}</b>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className={styles.spacer} />
      <ButtonLink block to={paths.history()}>
        {fr.results.seeHistory}
      </ButtonLink>
      <ButtonLink block variant="blanc" to={paths.home()}>
        {fr.results.backToGames}
      </ButtonLink>
    </Screen>
  )
}
