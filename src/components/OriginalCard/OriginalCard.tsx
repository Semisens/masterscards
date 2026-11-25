import type { CSSProperties } from 'react'
import { pickTextColor } from '../../core/contrast.ts'
import { tokens } from '../../core/tokens.generated.ts'
import { pickHand } from '../../data/hand.ts'
import type { OriginalCard as OriginalCardData } from '../../data/types.ts'
import { CardHand } from '../CardHand/CardHand.tsx'
import styles from './OriginalCard.module.css'

/** `list` : mini-carte des lignes (44 px) ; `strip` : carte de la rangée de la vue à balayer (3,5 rem). */
export type OriginalCardVariant = 'list' | 'strip'

export interface OriginalCardProps {
  card: OriginalCardData
  variant?: OriginalCardVariant
}

/**
 * Une carte du jeu d'origine. Avec une image (`image`, découpée d'une planche : `npm run planche`), la carte EST l'image,
 * chiffre compris. Sans image, elle est dessinée : un fond de sa couleur et sa valeur, en blanc ou en encre selon le
 * contraste (pas de portrait ni de texte officiel). Une carte dessinée peut porter une forme en grand sous la valeur
 * (`figure`, recolorée en `figure_color` : un masque) et la couleur de chiffre de la carte d'origine (`value_color`,
 * avec un fin contour). Elle peut aussi être carrée (`square`), avoir deux couleurs de fond en diagonale (`color2`)
 * et une icône en couleurs au centre (`icon`) : les cartes de rôle du Loup-garou.
 * Décorative : la légende ou le titre de la ligne disent la même chose.
 */
export function OriginalCard({ card, variant = 'list' }: OriginalCardProps) {
  const size = [variant === 'strip' ? styles.strip : styles.list, card.square ? styles.square : '']
    .filter(Boolean)
    .join(' ')
  if (card.imageUrl) {
    return (
      <span className={`${styles.card} ${size} ${styles.picture}`} aria-hidden="true">
        <img className={styles.image} src={card.imageUrl} alt="" />
      </span>
    )
  }
  const text = card.value_color ?? pickTextColor(card.color)?.color ?? tokens.colors.encre
  const style = {
    // Deux couleurs : la carte coupée en diagonale, la première en haut à gauche.
    '--original-bg': card.color2 ? `linear-gradient(135deg, ${card.color} 50%, ${card.color2} 50%)` : card.color,
    '--original-fg': text,
    ...(card.figureUrl ? { '--figure': `url("${card.figureUrl}")`, '--figure-color': card.figure_color ?? text } : {}),
  } as CSSProperties
  return (
    <span className={`${styles.card} ${size}`} style={style} aria-hidden="true">
      {card.figureUrl && <span className={styles.figure} />}
      {card.iconUrl && <img className={styles.icon} src={card.iconUrl} alt="" />}
      {card.value && (
        <span className={card.value_color ? `${styles.value} ${styles.outlined}` : styles.value}>{card.value}</span>
      )}
    </span>
  )
}

export interface OriginalCardsProps {
  cards: OriginalCardData[]
}

/**
 * Les cartes d'origine d'une ligne de la liste : une carte, ou une main de 2 ou 3 cartes en éventail
 * (« 2–6 » : le 2, le 4 et le 6) pour dire qu'il y en a plusieurs sans prendre de place.
 */
export function OriginalCards({ cards }: OriginalCardsProps) {
  const shown = pickHand(cards)
  if (shown.length === 1) return <OriginalCard card={shown[0]} />
  return (
    <CardHand>
      {shown.map((card, index) => (
        <OriginalCard key={`${card.value}-${index}`} card={card} />
      ))}
    </CardHand>
  )
}
