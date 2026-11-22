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

/**
 * Podium d'une partie terminée ou interrompue : tous les joueurs en liste, du premier au dernier, avec leur score.
 * Les trois premiers ont une médaille (🥇 🥈 🥉 ; ex aequo, la même), les suivants leur rang (« 4e »).
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
  // Beaucoup de joueurs (Loup-garou) : lignes serrées, blocs serrés.
  const crowded = isCrowded(ranked.length)

  return (
    <Screen tight={crowded}>
      <span className={`${styles.status} ${entry.status === 'finished' ? styles.finished : styles.interrupted}`}>
        {entry.status === 'finished' ? fr.results.finished : fr.results.interrupted}
      </span>
      <PageTitle>{fr.results.title}</PageTitle>

      <Panel>
        <ol className={crowded ? `${styles.list} ${styles.crowded}` : styles.list} aria-label={fr.results.podium}>
          {ranked.map((player, i) => (
            <li
              key={i}
              className={styles.row}
              aria-label={`${fr.results.place(player.rank)} : ${player.name}, ${player.score}`}
            >
              <span className={player.rank <= 3 ? styles.medal : styles.place} aria-hidden="true">
                {fr.results.medal(player.rank)}
              </span>
              <span className={styles.name} aria-hidden="true">
                {player.name}
              </span>
              <b className={styles.score} aria-hidden="true">
                {player.score}
              </b>
            </li>
          ))}
        </ol>
      </Panel>

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
