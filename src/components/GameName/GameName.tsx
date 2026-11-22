import type { CSSProperties, ReactNode } from 'react'
import type { Game } from '../../data/types.ts'
import styles from './GameName.module.css'

/** Un morceau du nom, avec un fin contour s'il en a un. */
function Part({ children, color, outline }: { children: ReactNode; color?: string; outline?: string }) {
  if (!color && !outline) return <>{children}</>
  const style = {
    ...(color ? { '--name-color': color } : {}),
    ...(outline ? { '--name-outline': outline } : {}),
  } as CSSProperties
  const className = [color ? styles.colored : '', outline ? styles.outlined : ''].filter(Boolean).join(' ')
  return (
    <span className={className} style={style}>
      {children}
    </span>
  )
}

/**
 * Le nom d'un jeu, tel qu'il s'affiche (tuile de l'accueil, bandeau, historique) : un morceau peut s'écrire dans une
 * autre couleur (`name_accent`, sa première occurrence, avec son contour ; ex. le « 6 » de « 6 qui prend ! » en bleu,
 * contour blanc), et le reste porter un fin contour (`name_outline`). Le texte lu reste le nom entier.
 */
export function GameName({ game }: { game: Pick<Game, 'name' | 'name_accent' | 'name_outline'> }) {
  const accent = game.name_accent
  const at = accent ? game.name.indexOf(accent.text) : -1
  const outline = game.name_outline
  if (!accent || at < 0) return <Part outline={outline}>{game.name}</Part>
  const before = game.name.slice(0, at)
  const after = game.name.slice(at + accent.text.length)
  return (
    <>
      {before && <Part outline={outline}>{before}</Part>}
      <Part color={accent.color} outline={accent.outline}>
        {accent.text}
      </Part>
      {after && <Part outline={outline}>{after}</Part>}
    </>
  )
}
