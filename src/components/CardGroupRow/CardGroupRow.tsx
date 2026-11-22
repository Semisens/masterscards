import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { CardGroup, OriginalCard, ReadingMode } from '../../data/types.ts'
import { handOf } from '../../data/hand.ts'
import { fr } from '../../i18n/fr.ts'
import { CardHand } from '../CardHand/CardHand.tsx'
import { GhostCard } from '../GhostCard/GhostCard.tsx'
import { OriginalCards } from '../OriginalCard/OriginalCard.tsx'
import { PlayingCard } from '../PlayingCard/PlayingCard.tsx'
import styles from './CardGroupRow.module.css'

export interface CardGroupRowProps {
  group: CardGroup
  mode: ReadingMode
  /** Adresse de la vue à balayer de ce groupe. */
  to: string
}

/**
 * La main du groupe (2 ou 3 cartes), ou la carte seule d'un groupe d'une seule carte, au format de la liste.
 * Sert aussi aux lignes de « Compter les points ».
 */
export function HandOfGroup({ group }: { group: Pick<CardGroup, 'cards' | 'display'> }) {
  const cards = handOf(group)
  if (cards.length === 1) return <PlayingCard {...cards[0]} variant="list" />
  return (
    <CardHand>
      {cards.map((card, index) => (
        <PlayingCard key={index} {...card} variant="list" />
      ))}
    </CardHand>
  )
}

export interface CardRowProps {
  /** Le jeu de cartes de la ligne : la main du paquet (2 ou 3 cartes) ou la carte seule. */
  set: Pick<CardGroup, 'cards' | 'display' | 'count'>
  /** Connaisseur : les cartes d'origine dessinées, ou le texte d'une carte en pointillés. Absent : mode Classique. */
  original?: { cards?: OriginalCard[]; label: string }
  title: string
  short?: string
  badge?: string
  /** Adresse : la ligne est un lien, avec un chevron. Absent : une ligne simple, avec `end` à droite. */
  to?: string
  /** À droite de la ligne, quand elle n'est pas un lien (la pastille des points). */
  end?: ReactNode
}

/**
 * Une ligne au format de la liste « Tes cartes », sur deux lignes, sans retour à la ligne. Sert à « Tes cartes »
 * (`CardGroupRow`, un lien) et à « Compter les points » (une ligne simple, les points à droite).
 * Connaisseur : la carte d'origine (dessinée, ou en pointillés), une flèche, puis la main du paquet.
 */
export function CardRow({ set, original, title, short, badge, to, end }: CardRowProps) {
  const className = [styles.row, original ? styles.expert : '', to ? '' : styles.static].filter(Boolean).join(' ')
  const content = (
    <>
      {original && (
        <>
          {original.cards ? <OriginalCards cards={original.cards} /> : <GhostCard label={original.label} />}
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </>
      )}
      {/* La carte est décorative : le titre et le sous-titre portent l'information. */}
      <span aria-hidden="true" className={styles.card}>
        <HandOfGroup group={set} />
      </span>
      <span className={styles.text}>
        <span className={styles.titleLine}>
          <b className={styles.title}>{title}</b>
          <span className={styles.count}>{fr.cards.count(set.count)}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        {short && <span className={styles.short}>{short}</span>}
      </span>
      {to ? <span aria-hidden="true">›</span> : end}
    </>
  )
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}

/**
 * Une ligne de la vue liste : le groupe de cartes à garder, sur deux lignes, sans retour à la ligne.
 * Mode classique : la main (2 ou 3 cartes) ; ligne 1 « 2 à 6 15 cartes » (les cartes à garder, leur nombre) ; ligne 2 « Valent 2 à 6. ».
 * Mode connaisseur : la main d'origine (dessinée, ou une carte en pointillés sans `expert.cards`), une flèche, puis la main du paquet ;
 * ligne 1 « 2–6 15 cartes » (la carte du jeu d'origine, le nombre de cartes) ; ligne 2 identique (la valeur ou le pouvoir).
 */
export function CardGroupRow({ group, mode, to }: CardGroupRowProps) {
  const expert = mode === 'expert'
  return (
    <CardRow
      set={group}
      original={expert ? { cards: group.expert.cards, label: group.expert.original } : undefined}
      title={expert ? (group.expert.name ?? group.expert.original) : group.label}
      short={group.short}
      badge={group.badge}
      to={to}
    />
  )
}
