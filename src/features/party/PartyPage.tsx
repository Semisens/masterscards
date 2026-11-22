import { Link, Navigate, useParams } from 'react-router'
import { Button } from '../../components/Button/Button.tsx'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { CardPile } from '../../components/CardPile/CardPile.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { PlayerChip } from '../../components/PlayerChip/PlayerChip.tsx'
import { ResourceTile } from '../../components/ResourceTile/ResourceTile.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { fill } from '../../core/format.ts'
import { getGame } from '../../data/games.ts'
import { resolveGameTheme } from '../../data/theme.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { isCrowded } from '../../state/session.ts'
import { useSession } from '../../state/useSession.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { playerColor } from './playerColors.ts'
import { useEndGame } from './useEndGame.ts'
import styles from './PartyPage.module.css'

/** Partie en cours : les jetons des joueurs et leurs scores, des raccourcis vers les règles, et la saisie des scores. */
export function PartyPage() {
  const { gameId } = useParams()
  const game = getGame(gameId)
  const { status, session } = useSession(gameId ?? '')
  const endGame = useEndGame(gameId ?? '')

  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />
  if (status === 'loading') return null
  // Pas de partie en cours : on commence par dire qui joue.
  if (!session) return <Navigate to={paths.players(game.id)} replace />

  const theme = resolveGameTheme(game)
  const { scoring } = game
  // Les mots du jeu : « Manche 3 », « Trios gagnés »…
  const aside = fill(scoring.party_label, { round: session.round })
  // Beaucoup de joueurs (Loup-garou) : petits jetons, quatre par ligne, blocs serrés.
  const crowded = isCrowded(session.players.length)

  return (
    <Screen solid={theme.main} solidText={theme.text} tight={crowded}>
      <div className={styles.top}>
        <Link to={paths.game(game.id)} className={styles.quit}>
          <span aria-hidden="true">‹ </span>
          {fr.nav.back}
        </Link>
        <span>{aside}</span>
      </div>
      <PageTitle>{fr.party.title}</PageTitle>

      {/* Sans prénoms, pas de jetons : « Joueur 1 » ne dit rien. Ils apparaissent quand on les renseigne. */}
      {!session.unnamed && (
        <div
          className={crowded ? `${styles.players} ${styles.crowded}` : styles.players}
          role="group"
          aria-label={fr.party.players}
        >
          {session.players.map((player, index) => {
            const { color, text } = playerColor(index)
            return (
              <PlayerChip
                key={index}
                name={player.name}
                score={player.score}
                color={color}
                textColor={text}
                small={crowded}
              />
            )
          })}
        </div>
      )}

      <div className={styles.tiles}>
        <ResourceTile to={paths.rules(game.id, true)} icon="rules" accent={theme.main} shadow={theme.shadow}>
          {fr.party.rules}
        </ResourceTile>
        <ResourceTile to={paths.setup(game.id, true)} icon="setup" accent={theme.main} shadow={theme.shadow}>
          {fr.party.setup}
        </ResourceTile>
        <ResourceTile to={paths.cards(game.id, true)} icon="cards" accent={theme.main} shadow={theme.shadow}>
          {fr.party.cards}
        </ResourceTile>
        <ResourceTile to={paths.turn(game.id, true)} icon="turn" accent={theme.main} shadow={theme.shadow}>
          {fr.party.turn}
        </ResourceTile>
      </div>

      {/* La pioche, de dos, à la couleur du jeu : un décor qui rappelle de quoi on joue. */}
      <div className={styles.spacer}>
        <CardPile layout="pile" width="5.5rem" />
      </div>
      <ButtonLink block to={paths.scores(game.id)}>
        {fr.party.enterScores}
      </ButtonLink>
      <Button
        block
        variant="blanc"
        style={{ '--btn-fg': theme.main, '--btn-shadow': theme.shadow } as React.CSSProperties}
        onClick={() => void endGame(session, 'interrupted')}
      >
        {fr.party.end}
      </Button>
    </Screen>
  )
}
