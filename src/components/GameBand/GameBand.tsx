import { Link } from 'react-router'
import { fr } from '../../i18n/fr.ts'
import type { Game } from '../../data/types.ts'
import { resolveGameTheme } from '../../data/theme.ts'
import { themeStyle } from '../../data/themeStyle.ts'
import { GameName } from '../GameName/GameName.tsx'
import styles from './GameBand.module.css'

export interface GameBandProps {
  game: Game
  backTo: string
}

/** Bandeau du jeu, en haut de sa page : tapis plein cadre, retour, nom dans sa police, joueurs et durée. */
export function GameBand({ game, backTo }: GameBandProps) {
  const theme = resolveGameTheme(game)
  return (
    <header className={styles.band} style={themeStyle(theme)}>
      <Link to={backTo} className={styles.back}>
        <span aria-hidden="true">‹ </span>
        {fr.nav.back}
      </Link>
      <h1 className={styles.name}>
        <GameName game={game} />
      </h1>
      <p className={styles.facts}>{fr.game.facts(game.players.min, game.players.max, game.duration_min)}</p>
    </header>
  )
}
