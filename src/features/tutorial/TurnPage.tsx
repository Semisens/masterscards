import { useParams } from 'react-router'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { CardTable } from '../../components/CardTable/CardTable.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { useFromParty } from './useFlow.ts'
import styles from './TurnPage.module.css'

/**
 * « Un tour de jeu » : la table (celle de la mise en place, des cartes retournées), les étapes, la façon de gagner, puis
 * « Jouer » (ou « Suivant » vers « Compter les points », si le jeu a cet écran).
 */
export function TurnPage() {
  const { gameId } = useParams()
  const fromParty = useFromParty()
  const game = getGame(gameId)
  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />

  const { turn } = game.tutorial
  return (
    <Screen>
      <StepHeader
        backTo={fromParty ? paths.party(game.id) : paths.setup(game.id)}
        quitTo={fromParty ? undefined : paths.game(game.id)}
      />
      <PageTitle>{turn.title}</PageTitle>
      {/* La table de la mise en place, à l'identique : seules quelques cartes sont retournées. */}
      <CardTable hand={game.tutorial.setup.hand} center={game.tutorial.setup.center} reveal={turn.reveal} />
      <Panel>
        {turn.steps.map((step, index) => (
          <p key={step.label} className={styles.step}>
            <b>
              {index + 1}. {step.label}
            </b>{' '}
            {step.text}
          </p>
        ))}
      </Panel>
      <Panel>
        <b>{turn.win.title}</b>
        <br />
        {turn.win.text}
      </Panel>
      <div className={styles.spacer} />
      {fromParty ? (
        <ButtonLink block to={paths.party(game.id)}>
          {fr.nav.backToParty}
        </ButtonLink>
      ) : game.points ? (
        // Le jeu a un écran « Compter les points » : il vient avant « Qui joue ? ».
        <ButtonLink block to={paths.points(game.id)}>
          {fr.nav.next}
        </ButtonLink>
      ) : (
        <ButtonLink block to={paths.players(game.id)}>
          {fr.nav.play}
        </ButtonLink>
      )}
    </Screen>
  )
}
