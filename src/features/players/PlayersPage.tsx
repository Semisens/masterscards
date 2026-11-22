import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button/Button.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { getGame } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import { isCrowded, newSession } from '../../state/session.ts'
import { useSession } from '../../state/useSession.ts'
import { NotFoundPage } from '../not-found/NotFoundPage.tsx'
import { useFromParty } from '../tutorial/useFlow.ts'
import styles from './PlayersPage.module.css'

/**
 * « Qui joue ? » : le nombre de joueurs (dans les limites du jeu) et leurs prénoms.
 * Écran ajouté : les maquettes montrent la partie en cours (Léa, Tom, Inès) mais pas sa création.
 */
export function PlayersPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = getGame(gameId)
  const fromParty = useFromParty()
  const { status, session, save } = useSession(gameId ?? '')
  // Les prénoms modifiés par l'utilisateur ; tant qu'il n'a rien changé, les champs sont vides.
  const [edited, setEdited] = useState<string[] | null>(null)
  // Les champs partent toujours vides (« Joueur 1 » n'est qu'un repli) ; seul le nombre de joueurs
  // de la partie en cours est repris, à défaut le minimum du jeu.
  const initial = Array.from({ length: session?.players.length ?? game?.players.min ?? 0 }, () => '')
  const names = edited ?? initial
  const setNames = (update: (current: string[]) => string[]) => setEdited(update(names))
  // Sans aucun prénom, on ne valide pas ici : « Passer cette étape » (en haut) est le chemin des parties sans prénoms.
  const hasName = names.some((name) => name.trim() !== '')

  if (!game) return <NotFoundPage message={fr.errors.gameNotFound} />
  if (status !== 'ready') return null

  const { min, max } = game.players
  // Beaucoup de joueurs (Loup-garou) : les prénoms sur deux colonnes, pour tenir sans défilement.
  const crowded = isCrowded(names.length)
  const setCount = (count: number) => setNames((current) => Array.from({ length: count }, (_, i) => current?.[i] ?? ''))

  // Les noms vides reçoivent « Joueur n » : passer l'étape, c'est démarrer sans aucun prénom.
  const start = async (players: string[]) => {
    const next = newSession(players, fr.players.defaultName)
    await save(next)
    // Venu de la partie pour noter les scores : on y va droit une fois un prénom donné ; sinon, la partie.
    navigate(fromParty && !next.unnamed ? paths.scores(game.id) : paths.party(game.id))
  }

  return (
    <Screen tight={crowded}>
      <StepHeader
        backTo={fromParty ? paths.party(game.id) : game.points ? paths.points(game.id) : paths.turn(game.id)}
        onSkip={fromParty ? undefined : () => void start(names.map(() => ''))}
      />
      <PageTitle>{fr.players.title}</PageTitle>
      <p className={styles.intro}>{fromParty ? fr.players.introForScores : fr.players.intro}</p>
      <Panel>
        <div className={styles.count}>
          <span className={styles.label}>{fr.players.count}</span>
          <button
            type="button"
            className={styles.round}
            aria-label={fr.players.fewer}
            disabled={names.length <= min}
            onClick={() => setCount(names.length - 1)}
          >
            −
          </button>
          <b className={styles.number} aria-live="polite">
            {names.length}
          </b>
          <button
            type="button"
            className={styles.round}
            aria-label={fr.players.more}
            disabled={names.length >= max}
            onClick={() => setCount(names.length + 1)}
          >
            +
          </button>
        </div>
        <div className={crowded ? styles.grid : undefined}>
          {names.map((name, index) => (
            <div key={index} className={styles.field}>
              <input
                className={styles.input}
                type="text"
                value={name}
                maxLength={20}
                autoComplete="off"
                placeholder={fr.players.defaultName(index + 1)}
                aria-label={fr.players.nameLabel(index + 1)}
                onChange={(event) =>
                  setNames((current) => current?.map((n, i) => (i === index ? event.target.value : n)) ?? null)
                }
              />
            </div>
          ))}
        </div>
      </Panel>
      <div className={styles.spacer} />
      <Button block disabled={!hasName} onClick={() => void start(names)}>
        {fr.players.start}
      </Button>
    </Screen>
  )
}
