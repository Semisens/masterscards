import { Link } from 'react-router'
import { fr } from '../../i18n/fr.ts'
import { logoUrl } from '../../data/games.ts'
import type { Game } from '../../data/types.ts'
import { resolveGameTheme } from '../../data/theme.ts'
import { themeStyle } from '../../data/themeStyle.ts'
import { paths } from '../../routes.ts'
import styles from './GameTile.module.css'

export interface GameTileProps {
  game: Game
}

/**
 * Vignette d'un jeu sur l'accueil : un carré aux couleurs du jeu avec son logo ou son initiale, puis le nom
 * et « 2–4 joueurs · 20 min » sur fond blanc.
 */
export function GameTile({ game }: GameTileProps) {
  const theme = resolveGameTheme(game)
  const url = logoUrl(game)
  return (
    <Link to={paths.game(game.id)} className={styles.tile} style={themeStyle(theme)}>
      <span className={styles.mark} aria-hidden="true">
        {url ? <img className={styles.image} src={url} alt="" /> : game.name.charAt(0).toUpperCase()}
      </span>
      <span className={styles.text}>
        {/* Le nom tel quel, sans la couleur ni le contour du bandeau : l'accueil reste sobre. */}
        <span className={styles.name}>{game.name}</span>
        <span className={styles.meta}>{fr.game.facts(game.players.min, game.players.max, game.duration_min)}</span>
      </span>
    </Link>
  )
}
