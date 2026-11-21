import { useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button/Button.tsx'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { CardGroupRow } from '../../components/CardGroupRow/CardGroupRow.tsx'
import { ModeToggle } from '../../components/ModeToggle/ModeToggle.tsx'
import { Notice } from '../../components/Notice/Notice.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { deckPlan, removalList } from '../../data/deck.ts'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { useMode } from '../../state/modeContext.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { useFromParty } from '../tutorial/useFlow.ts'
import styles from './CardsPage.module.css'

/**
 * « Tes cartes » : le mode de lecture se choisit ici (bascule Classique / Connaisseur), puis la liste des
 * groupes de cartes à garder. Une ligne ouvre la vue à balayer du groupe.
 */
export function CardsPage() {
  const { gameId } = useParams()
  const { mode, setMode } = useMode()
  const navigate = useNavigate()
  const fromParty = useFromParty()
  const game = getGame(gameId)
  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />

  const plan = deckPlan(game)
  const removal = removalList(plan)
  const sentence =
    plan.removedTotal === 0 && plan.keptJokers > 0
      ? fr.cards.keepAllWithJokers(plan.keptJokers)
      : plan.removalMode === 'keepOnly'
        ? fr.cards.keepOnly(plan.keptTotal, plan.keptJokers)
        : removal
          ? `${fr.cards.remove(removal)} ${fr.cards.keep(plan.keptTotal)}`
          : fr.cards.keepAll

  return (
    <Screen fixed tight>
      <StepHeader
        backTo={fromParty ? paths.party(game.id) : paths.game(game.id)}
        quitTo={fromParty ? undefined : paths.game(game.id)}
      />
      <PageTitle>{fr.cards.title}</PageTitle>
      <ModeToggle mode={mode} onChange={setMode} />
      <div className={styles.list}>
        {plan.groups.map((group, index) => (
          <CardGroupRow key={group.label} group={group} mode={mode} to={paths.group(game.id, index + 1, fromParty)} />
        ))}
      </div>
      <Notice>{sentence}</Notice>
      {fromParty ? (
        <Button block onClick={() => navigate(paths.party(game.id))}>
          {fr.nav.backToParty}
        </Button>
      ) : (
        <ButtonLink block to={paths.setup(game.id)}>
          {fr.nav.next}
        </ButtonLink>
      )}
    </Screen>
  )
}
