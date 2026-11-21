import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button/Button.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { PillLink } from '../../components/PillLink/PillLink.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { ScoreStepper } from '../../components/ScoreStepper/ScoreStepper.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { fill } from '../../core/format.ts'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { endRound, hasWinner, MAX_SCORE } from '../../state/session.ts'
import { useSession } from '../../state/useSession.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { useEndGame } from './useEndGame.ts'
import styles from './ScorePage.module.css'

/**
 * Saisie des scores, la même pour tous les jeux : un compteur par joueur, qui part de zéro et donne les points
 * gagnés depuis la saisie précédente. Valider les ajoute aux scores et passe à la manche suivante. Si quelqu'un
 * atteint le score visé (`scoring.target`), la partie est terminée. Rien n'est enregistré avant la validation.
 */
export function ScorePage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = getGame(gameId)
  const { status, session, save } = useSession(gameId ?? '')
  const endGame = useEndGame(gameId ?? '')
  // Les points gagnés, tant qu'ils ne sont pas validés.
  const [edited, setEdited] = useState<number[] | null>(null)

  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />
  if (status === 'loading') return null
  if (!session) return <Navigate to={paths.players(game.id)} replace />
  // Partie sans prénoms : on les demande avant de noter les scores, puis on revient ici.
  if (session.unnamed) return <Navigate to={paths.players(game.id, true)} replace />

  const { scoring } = game
  const values = edited ?? session.players.map(() => 0)

  const validate = async () => {
    const next = endRound(session, values)
    if (hasWinner(next, scoring)) await endGame(next, 'finished')
    else {
      await save(next)
      navigate(paths.party(game.id))
    }
  }

  return (
    <Screen>
      <StepHeader backTo={paths.party(game.id)} />
      <PageTitle>{fill(scoring.title, { round: session.round })}</PageTitle>
      <p className={styles.question}>{scoring.question}</p>
      {/* Le jeu a un écran « Compter les points » : on l'ouvre au moment où l'on compte, il ramène ici. */}
      {game.points && (
        <div className={styles.count}>
          <PillLink to={paths.points(game.id, true)}>{fr.points.link}</PillLink>
        </div>
      )}
      <Panel>
        {session.players.map((player, index) => (
          <ScoreStepper
            key={index}
            name={player.name}
            value={values[index] ?? 0}
            max={MAX_SCORE}
            unit={scoring.unit}
            onChange={(value) => setEdited(values.map((v, i) => (i === index ? value : v)))}
          />
        ))}
      </Panel>
      <div className={styles.spacer} />
      <Button block onClick={() => void validate()}>
        {scoring.validate}
      </Button>
    </Screen>
  )
}
