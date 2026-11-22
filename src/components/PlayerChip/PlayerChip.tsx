import type { CSSProperties } from 'react'
import styles from './PlayerChip.module.css'

export interface PlayerChipProps {
  name: string
  score: number
  /** Couleur du jeton (toute couleur CSS). */
  color: string
  /** Couleur du chiffre : celle qui contraste avec le jeton. */
  textColor: string
  /** Jeton plus petit (plus de 6 joueurs : quatre par ligne). */
  small?: boolean
}

/** Jeton d'un joueur : cercle à bord pointillé, son nombre de trios, et son nom dessous. */
export function PlayerChip({ name, score, color, textColor, small = false }: PlayerChipProps) {
  const style = { '--chip': color, '--chip-text': textColor } as CSSProperties
  return (
    <div className={small ? `${styles.player} ${styles.small}` : styles.player} style={style}>
      <div className={styles.chip} role="img" aria-label={`${name} : ${score}`}>
        <span aria-hidden="true">{score}</span>
      </div>
      <span aria-hidden="true">{name}</span>
    </div>
  )
}
