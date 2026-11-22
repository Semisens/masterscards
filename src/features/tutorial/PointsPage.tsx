import { useParams } from 'react-router'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { CardRow } from '../../components/CardGroupRow/CardGroupRow.tsx'
import { ModeToggle } from '../../components/ModeToggle/ModeToggle.tsx'
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
 * depuis la saisie des scores (`?depuis=scores`) et y ramène. Les lignes sont celles de « Tes cartes » (`CardRow`),
 * avec la même bascule Classique / Connaisseur : en Connaisseur, la carte d'origine, une flèche, et sa valeur d'origine
 * (« 7 têtes ») en titre. Les points sont à droite.
 */
export function PointsPage() {
  const { gameId } = useParams()
  const { mode, setMode } = useMode()
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
      <ModeToggle mode={mode} onChange={setMode} />
      {intro && <p className={styles.intro}>{intro}</p>}
      <ul className={styles.list} aria-label={fr.points.list}>
        {rows.map((row) => {
          const expert = mode === 'expert'
          return (
            <li key={row.label}>
              <CardRow
                set={row}
                original={
                  expert ? { cards: row.expert_card && [row.expert_card], label: row.expert ?? row.label } : undefined
                }
                title={expert ? (row.expert ?? row.label) : row.label}
                short={row.short}
                end={<span className={styles.value}>{fr.points.value(row.points)}</span>}
              />
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
