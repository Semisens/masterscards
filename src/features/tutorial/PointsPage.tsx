import { useParams } from 'react-router'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { HandOfGroup } from '../../components/CardGroupRow/CardGroupRow.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { useMode } from '../../state/modeContext.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { useFromScores } from './useFlow.ts'
import styles from './PointsPage.module.css'

/**
 * « Compter les points », écran facultatif (`points` du jeu), le même pour tous les jeux : une ligne par valeur, avec
 * ses cartes et les points qu'elles rapportent. Dans le tutoriel, il suit « Un tour » ; pendant la partie, il s'ouvre
 * depuis la saisie des scores (`?depuis=scores`) et y ramène. Mode connaisseur : la valeur d'origine sous le titre.
 */
export function PointsPage() {
  const { gameId } = useParams()
  const { mode } = useMode()
  const fromScores = useFromScores()
  const game = getGame(gameId)
  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />
  if (!game.points) return <NotFoundPage message={fr.errors.pageNotFound} />

  const { intro, rows } = game.points
  return (
    <Screen tight>
      <StepHeader
        backTo={fromScores ? paths.scores(game.id) : paths.turn(game.id)}
        quitTo={fromScores ? undefined : paths.game(game.id)}
      />
      <PageTitle>{fr.points.title}</PageTitle>
      {intro && <p className={styles.intro}>{intro}</p>}
      <ul className={styles.list} aria-label={fr.points.list}>
        {rows.map((row) => {
          const note = mode === 'expert' ? (row.expert ?? row.short) : row.short
          return (
            <li key={row.label} className={styles.row}>
              {/* La carte est décorative : le titre et la valeur portent l'information. */}
              <span aria-hidden="true" className={styles.card}>
                <HandOfGroup group={row} />
              </span>
              <span className={styles.text}>
                <b className={styles.title}>{row.label}</b>
                {note && <span className={styles.note}>{note}</span>}
              </span>
              <span className={styles.value}>{fr.points.value(row.points)}</span>
            </li>
          )
        })}
      </ul>
      <div className={styles.spacer} />
      {fromScores ? (
        <ButtonLink block to={paths.scores(game.id)}>
          {fr.points.backToScores}
        </ButtonLink>
      ) : (
        <ButtonLink block to={paths.players(game.id)}>
          {fr.nav.play}
        </ButtonLink>
      )}
    </Screen>
  )
}
