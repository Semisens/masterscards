import { shade, shadowOf, tint } from '../core/color.ts'
import { MIN_CONTRAST, contrastRatio, luminance } from '../core/contrast.ts'
import { gameFontStyle, type FontStyle } from '../core/fonts.ts'
import { tokens } from '../core/tokens.generated.ts'
import type { Game, GameColor } from './types.ts'

/** Fond des écrans d'un jeu : un dégradé discret tiré de `background_color`, et le texte dessus. */
export interface ScreenTheme {
  /** Couleur de base (celle du YAML) : repli derrière la page, sous les barres système. */
  base: string
  /** Haut du dégradé, un peu plus clair. */
  from: string
  /** Bas du dégradé, un peu plus foncé. */
  to: string
  /** Texte lisible sur tout le dégradé. */
  text: string
  /** Relief des surfaces blanches posées sur ce fond (cartes, panneaux, boutons) : un ton du fond, pas le bleu de l'app. */
  edge: string
}

export interface GameTheme {
  /** Couleur du jeu (`main_color`, le « tapis ») : tuile, bandeau, écran de partie, pastilles. */
  main: string
  /** Texte lisible sur `main` : blanc ou encre, choisi automatiquement, ou `text_color`. */
  text: string
  /** Ombre en relief de `main`. */
  shadow: string
  /** Fond des écrans du jeu. Absent : le bleu de l'app. */
  screen?: ScreenTheme
  /** Couleur du dos des cartes. */
  cardBack: string
  /** Couleur des rayures du dos, alors fines. Absent : rayures blanches translucides de la charte. */
  cardBackStripe?: string
  font: FontStyle
}

/** Part de la couleur de fond conservée en haut et en bas du dégradé (le reste est du blanc, du noir). */
const GRADIENT_TOP_KEEP = 0.92
const GRADIENT_BOTTOM_KEEP = 0.82
/** Au-dessus de cette luminance, le fond est « clair » : le relief est un ton plus foncé, sinon un ton plus clair. */
const EDGE_LIGHT_BACKGROUND = 0.4
const EDGE_SHADE_KEEP = 0.8
const EDGE_TINT_KEEP = 0.75

/** Une couleur du YAML en hexadécimal, qu'elle vienne de la charte (nom de tapis) ou soit libre. */
export function colorHex(color: GameColor): string {
  return color.startsWith('#') ? color.toUpperCase() : tokens.tapis[color as keyof typeof tokens.tapis]
}

/** Ombre en relief du tapis : celle de la charte pour un tapis nommé, sinon la couleur assombrie. */
function shadowOfMain(color: GameColor, hex: string): string {
  return color.startsWith('#') ? shadowOf(hex) : tokens.tapisOmbres[color as keyof typeof tokens.tapisOmbres]
}

const worst = (text: string, backgrounds: string[]): number =>
  Math.min(...backgrounds.map((b) => contrastRatio(b, text)))

/**
 * Texte d'un fond (ou de tout un dégradé) : celui que le jeu donne s'il est lisible partout,
 * sinon blanc ou encre, choisi seul. Refuse un fond où aucun des deux n'atteint le contraste minimum.
 */
function resolveText(label: string, backgrounds: string[], wanted: string | undefined, field: string): string {
  if (wanted) {
    const ratio = worst(wanted, backgrounds)
    if (ratio < MIN_CONTRAST) {
      throw new Error(
        `Le texte ${wanted} sur ${label} ${backgrounds[0]} n'atteint qu'un contraste de ${ratio.toFixed(1)} (minimum ${MIN_CONTRAST}) : choisis un ${field} plus clair ou plus foncé.`,
      )
    }
    return wanted.toUpperCase()
  }
  const best = [tokens.colors.blanc_carte, tokens.colors.encre]
    .map((color) => ({ color, ratio: worst(color, backgrounds) }))
    .sort((a, b) => b.ratio - a.ratio)[0]
  if (best.ratio < MIN_CONTRAST) {
    throw new Error(
      `La couleur ${backgrounds[0]} (${label}) n'atteint pas un contraste de ${MIN_CONTRAST} avec le blanc ni avec l'encre : choisis une couleur plus claire ou plus foncée.`,
    )
  }
  return best.color
}

type ThemeInput = Pick<Game, 'main_color' | 'font'> &
  Partial<
    Pick<
      Game,
      | 'shadow_color'
      | 'text_color'
      | 'background_color'
      | 'background_text_color'
      | 'card_back_color'
      | 'card_back_stripe_color'
    >
  >

/**
 * Thème d'un jeu : `main_color` (avec son texte et son ombre, calculés ou donnés par `text_color` et `shadow_color`),
 * fond des écrans (`background_color`, avec son texte), dos des cartes (`card_back_color`, par défaut `main_color`).
 * Refuse tout texte sous 4,5 de contraste. Le test des jeux garantit qu'aucun jeu livré ne lève cette erreur.
 */
export function resolveGameTheme(game: ThemeInput): GameTheme {
  const main = colorHex(game.main_color)
  const base = game.background_color ? colorHex(game.background_color) : undefined
  const ends = base ? [base, tint(base, GRADIENT_TOP_KEEP), shade(base, GRADIENT_BOTTOM_KEEP)] : []
  return {
    main,
    text: resolveText('le tapis', [main], game.text_color, 'text_color'),
    shadow: game.shadow_color?.toUpperCase() ?? shadowOfMain(game.main_color, main),
    screen: base
      ? {
          base,
          from: ends[1],
          to: ends[2],
          text: resolveText('le fond', ends, game.background_text_color, 'background_text_color'),
          edge: luminance(base) > EDGE_LIGHT_BACKGROUND ? shade(base, EDGE_SHADE_KEEP) : tint(base, EDGE_TINT_KEEP),
        }
      : undefined,
    cardBack: game.card_back_color ? colorHex(game.card_back_color) : main,
    ...(game.card_back_stripe_color ? { cardBackStripe: game.card_back_stripe_color.toUpperCase() } : {}),
    font: gameFontStyle(game.font),
  }
}
