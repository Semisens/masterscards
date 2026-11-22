import type { CSSProperties } from 'react'
import type { CardLayout, DeckCard } from '../../data/types.ts'
import { CARDS_IN_LAYOUT, REVEALED_IN_LAYOUT } from './layouts.ts'
import { PlayingCard } from '../PlayingCard/PlayingCard.tsx'
import styles from './CardPile.module.css'

export interface CardPileProps {
  /**
   * `single` : une carte ; `pile` : la pioche, des dos empilés ; `spread` : une main, des dos en éventail incliné ;
   * `grid` : des cartes alignées, 3 x 2.
   */
  layout?: CardLayout
  /** Une carte retournée, face visible : au bord de la main, au milieu de la rangée du bas, sur le dessus de la pile. */
  reveal?: DeckCard
  /** Toutes les cartes de face, dans cet ordre (ta main pendant un tour) : leur nombre remplace celui de la disposition. */
  faces?: DeckCard[]
  /** Jeux de plis : l'index de la carte qui dépasse de la main (ta carte prête à jouer), remontée d'un tiers. */
  raised?: number
  /** Nombre de cartes, à la place de celui de la disposition (jeux de plis : 4 pour qui n'a pas encore joué). */
  count?: number
  /** Largeur d'une carte : toute longueur CSS. Défaut : 3,5 rem, comme les cartes des schémas. */
  width?: string
  className?: string
}

/**
 * Des cartes posées de dos : la pioche, une carte écartée, une main, des cartes alignées. Elles portent la couleur de
 * dos du jeu (`card_back_color`) ; l'une d'elles peut être retournée (`reveal`), ou toutes (`faces`). Décoratif : la légende et les étapes
 * disent la même chose, les lecteurs d'écran passent.
 */
export function CardPile({ layout = 'single', reveal, faces, count: cards, raised, width, className }: CardPileProps) {
  const count = faces?.length ?? cards ?? CARDS_IN_LAYOUT[layout]
  const revealed = reveal ? Math.min(REVEALED_IN_LAYOUT[layout], count - 1) : -1
  const faceOf = (index: number) => faces?.[index] ?? (index === revealed ? reveal : undefined)
  const cardStyle = (index: number) => ({ '--i': index, ...(index === raised ? { '--lift': 1 } : {}) }) as CSSProperties
  const style = { '--n': count, ...(width ? { '--pile-card-w': width } : {}) } as CSSProperties
  return (
    <span
      className={[styles.root, styles[layout], className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => faceOf(index)).map((face, index) =>
        face ? (
          <PlayingCard
            key={index}
            rank={face.rank}
            suit={face.suit}
            variant="table"
            width="var(--pile-card-w)"
            className={styles.card}
            style={cardStyle(index)}
          />
        ) : (
          <PlayingCard
            key={index}
            faceDown
            width="var(--pile-card-w)"
            className={styles.card}
            style={cardStyle(index)}
          />
        ),
      )}
    </span>
  )
}
