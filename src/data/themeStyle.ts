import type { CSSProperties } from 'react'
import type { GameTheme } from './theme.ts'

/** Variables CSS de la tuile et du bandeau d'un jeu : couleur du jeu, texte lisible dessus, ombre et police du nom. */
export function themeStyle(theme: GameTheme): CSSProperties {
  return {
    '--game-bg': theme.main,
    '--game-fg': theme.text,
    '--game-shadow': theme.shadow,
    '--game-font': theme.font.family,
    '--game-font-weight': theme.font.weight,
    '--game-band-size': theme.font.bandSize,
  } as CSSProperties
}

/**
 * Variables posées sur toute la page quand on est dans un jeu (`GameScope`) : le dos des cartes, toujours ; et, si le jeu
 * a son propre fond (`background_color`), ce fond, son texte, son relief et des pastilles à la couleur du jeu. Sur le
 * bleu de l'app, les pastilles gardent leur bleu nuit : seul un fond propre appelle des pastilles propres.
 * Les feuilles de style lisent ces variables avec le jeton de la charte en repli : hors d'un jeu, rien n'est posé.
 */
export function scopeVariables(theme: GameTheme): Record<string, string> {
  return {
    '--game-card-back': theme.cardBack,
    // Rayures d'une couleur propre : fines (un quart de la bande au lieu de la moitié).
    ...(theme.cardBackStripe
      ? { '--game-card-back-stripe': theme.cardBackStripe, '--game-card-back-stripe-share': '0.25' }
      : {}),
    ...(theme.screen
      ? {
          '--game-pill-bg': theme.main,
          '--game-pill-fg': theme.text,
          '--game-screen-base': theme.screen.base,
          '--game-screen-from': theme.screen.from,
          '--game-screen-to': theme.screen.to,
          '--game-screen-fg': theme.screen.text,
          '--game-edge': theme.screen.edge,
        }
      : {}),
  }
}
