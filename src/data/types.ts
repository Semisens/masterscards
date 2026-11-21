import type { Rank, Suit } from '../core/cards.ts'
import type { TapisName } from '../core/tokens.generated.ts'

// Deux familles de types :
// - `*Config` : ce qu'on écrit dans `src/content/games/<id>/game.yaml` (validé par `src/content/game.schema.json`) ;
// - les autres : le jeu prêt à l'emploi, calculé une fois au chargement (`src/data/loadGame.ts`).
// Les écrans ne lisent que le jeu prêt à l'emploi : ils sont les mêmes pour tous les jeux.

/** Un des quatre tapis de la charte, ou une couleur libre `#RRGGBB`. */
export type GameColor = TapisName | `#${string}`

/** Mode de lecture des cartes : Classique, ou Connaisseur (lien avec le jeu d'origine). */
export type ReadingMode = 'classic' | 'expert'

/** Un rang tel qu'on l'écrit en YAML : `2` (nombre) ou `"2"`, `J`, `A`… */
export type RankInput = Rank | number

/** Une carte précise du paquet. */
export interface DeckCard {
  rank: Rank
  suit: Suit
}

/** Un joker : il n'a ni rang ni couleur. Il vient en plus du paquet de 52 (paquet de 54). */
export interface JokerCard {
  joker: true
}

/** Ce que montre un groupe : une carte du paquet, ou un joker. */
export type DisplayCard = DeckCard | JokerCard

/** Des rangs, dans des couleurs (`all` : les quatre). Ex. les rois noirs : `{ ranks: [K], suits: [spades, clubs] }`. */
export interface CardSpecConfig {
  ranks: RankInput[]
  suits: Suit[] | 'all'
}

/** Police du nom du jeu. Sans `file`, une police déjà embarquée (Fredoka, Nunito). */
export interface FontConfig {
  /** Fichier woff2 déposé dans le dossier du jeu. */
  file?: string
  family: string
  weight?: number
  /** Taille du nom dans le bandeau, en multiples de 16 px. Défaut : 3,5. */
  band_size?: number
}

interface CardGroupBase {
  label: string
  /** Ligne 2 de la liste : la valeur ou le pouvoir (« Valent 2 à 6. »), une trentaine de caractères au plus. */
  short: string
  /** Pastille à côté du titre (ex. « Spécial »). */
  badge?: string
  /** Carte d'explication de la vue à balayer. */
  detail: { title: string; text: string }
  /** Correspondance avec le jeu d'origine (mode connaisseur). */
  expert: {
    /** Carte(s) du jeu d'origine (ex. « 2–6 »). */
    original: string
    /** Nom du personnage ou de la carte d'origine (ex. « Prêtre »). Absent : la ligne dit `original` (« 2–6 »). */
    name?: string
    /** Pouvoir ou règle d'origine, en une proposition. */
    power?: string
    /** Les cartes d'origine, dessinées en mode Connaisseur. Absent : une carte en pointillés. */
    cards?: OriginalCard[]
  }
}

/** Un groupe de cartes à garder, tel qu'écrit dans la configuration. */
export interface CardGroupConfig extends CardGroupBase, CardSetConfig {}

/**
 * Un groupe de cartes du paquet à garder : une ligne de la vue liste, une page de la vue à balayer.
 * Ex. pour Trio, « 2 à 6 » réunit cinq rangs en trois couleurs, soit 15 cartes.
 */
export interface CardGroup extends CardGroupBase, CardSet {}

/** Les cartes d'un groupe ou d'une ligne de points, telles qu'écrites dans la configuration. */
export interface CardSetConfig {
  /** Cartes du paquet de 52. Absent : des jokers seulement. */
  cards?: CardSpecConfig[]
  /** Nombre de jokers (le paquet de 52 n'en a pas : on prend ceux de la boîte). */
  jokers?: number
  /** Carte montrée. Absent : la première carte, ou le joker. */
  display?: { rank: RankInput; suit: Suit } | JokerCard
}

/** Les cartes d'un groupe ou d'une ligne de points, prêtes à l'emploi. */
export interface CardSet {
  /** Les cartes exactes, jokers exclus. */
  cards: DeckCard[]
  /** Nombre de jokers. */
  jokers: number
  /** Les rangs, dans l'ordre du paquet. */
  ranks: Rank[]
  /** Cartes, jokers compris. */
  count: number
  display: DisplayCard
}

/** Une ligne de « Compter les points », telle qu'écrite dans la configuration. */
export interface PointsRowConfig extends CardSetConfig {
  /** Titre de la ligne (« Les rois »). */
  label: string
  /** Sous le titre (« Jokers compris. »). */
  short?: string
  /** Points rapportés par chacune de ces cartes. */
  points: number
  /** Mode connaisseur : la valeur d'origine (« 5 têtes »). Remplace `short`. */
  expert?: string
}

/** Une ligne de « Compter les points » : ses cartes et ce qu'elles rapportent. */
export type PointsRow = Omit<PointsRowConfig, keyof CardSetConfig> & CardSet

/** L'écran facultatif « Compter les points » : une ligne par valeur. */
export interface Points<Row = PointsRow> {
  /** Phrase sous le titre. */
  intro?: string
  rows: Row[]
}

export interface TurnStep {
  label: string
  text: string
}

/** Comment on dessine des cartes de dos : une carte, une pile (la pioche), un éventail (une main), des cartes alignées. */
export type CardLayout = 'single' | 'pile' | 'spread' | 'grid'

/** Une carte du jeu d'origine : pastille de valeur sur fond de couleur. `image` : fichier du dossier du jeu. */
export interface OriginalCard {
  value: string
  name?: string
  color: string
  image?: string
  /** Adresse du fichier `image`, résolue au chargement du jeu. */
  imageUrl?: string
}

/** Une carte telle qu'on l'écrit en YAML : `{ rank: 5, suit: hearts }`. */
export interface DeckCardConfig {
  rank: RankInput
  suit: Suit
}

/**
 * Un élément légendé de la table : des cartes de dos (`layout`), une carte visible si `card` est donné, ou des rangées
 * si `cards` est donné : une ligne par carte, suivie d'emplacements vides jusqu'à `slots` places (6 qui prend).
 */
export interface DiagramItem<Card = DeckCard> {
  label: string
  layout?: CardLayout
  card?: Card
  cards?: Card[]
  slots?: number
}

export type DiagramItemConfig = DiagramItem<DeckCardConfig>

/**
 * « Un tour » : les cartes retournées sur la table de la mise en place (la même table, au pixel près).
 * - `hand` : ta main pendant le tour, de face (en éventail si elle a plusieurs cartes) ;
 * - `across` : la carte du bord de la main d'en face ;
 * - `center` : une carte par élément du centre, dans l'ordre ;
 * - `played` : la carte découverte posée à côté de la main d'un joueur (`you` : la tienne).
 */
export interface TurnReveal<Card = DeckCard> {
  hand?: Card[]
  across?: Card
  center?: Card[]
  played?: { across?: Card; left?: Card; right?: Card; you?: Card }
}

export interface Tutorial<Item = DiagramItem, Card = DeckCard> {
  /** Mise en place : ta main (sa disposition vaut pour les 4 mains de la table) et ce qui se pose au centre. */
  setup: { title: string; hand: Item; center: Item[]; steps: string[] }
  turn: { title: string; reveal?: TurnReveal<Card>; steps: TurnStep[]; win: { title: string; text: string } }
}

export interface RuleSection {
  title: string
  text: string
}

/**
 * Comment la partie se marque. Tous les jeux fonctionnent pareil : à chaque saisie, on note les points gagnés
 * depuis la précédente ; « Valider » les ajoute et passe à la manche suivante.
 */
export interface Scoring {
  /** Ce qu'on compte, au singulier (« trio », « point »). Sert aux libellés pour lecteurs d'écran. */
  unit: string
  /** En haut à droite de la partie en cours (« Manche {round} », « Trios gagnés »). */
  party_label: string
  /** Titre de l'écran de saisie. `{round}` est remplacé par le numéro de manche. */
  title: string
  question: string
  validate: string
  /** Points à atteindre pour gagner : un nombre, ou un nombre par effectif (clé = nombre de joueurs). Absent : pas de fin automatique. */
  target?: number | Record<string, number>
  /** Vrai si le plus petit score gagne (6 qui prend) : le classement se lit dans l'autre sens. Absent : le plus grand. */
  lowest_wins?: boolean
}

interface GameBase {
  id: string
  name: string
  /** Couleur du jeu (le « tapis ») : tuile, bandeau, écran de partie, pastilles et boutons discrets. */
  main_color: GameColor
  /** Fond de tous les écrans du jeu, à la place du bleu de l'app. */
  background_color?: GameColor
  /** Texte sur `background_color` (contraste ≥ 4,5). Absent : blanc ou encre, choisi seul. */
  background_text_color?: string
  /** Couleur du dos des cartes. Absent : `main_color`. */
  card_back_color?: GameColor
  /** Couleur libre `#RRGGBB` du relief du tapis. Absent : le tapis assombri. */
  shadow_color?: string
  /** Couleur libre `#RRGGBB` du texte sur le tapis (contraste ≥ 4,5). Absent : blanc ou encre, choisi seul. */
  text_color?: string
  /** Nom d'un fichier du dossier du jeu (svg ou png). Absent : initiale dans un rond blanc. */
  logo?: string
  /** Phrase d'accroche en gras, sur la page du jeu. */
  tagline: string
  /** Texte qui suit la phrase d'accroche. */
  description: string
  players: { min: number; max: number }
  duration_min: number
  /** Mot qui numérote la vue à balayer : « Groupe 3 / 6 » (défaut) ou « Carte 2 / 8 ». */
  group_word?: string
  scoring: Scoring
  /** Mots du jeu d'origine interdits dans les textes du mode classique (vérifié par test). Optionnel. */
  classic_forbidden_terms?: string[]
  full_rules: RuleSection[]
}

/** Le fichier `game.yaml` d'un jeu. */
export interface GameConfig extends GameBase {
  font?: FontConfig
  card_groups: CardGroupConfig[]
  /** Facultatif : l'écran « Compter les points ». */
  points?: Points<PointsRowConfig>
  tutorial: Tutorial<DiagramItemConfig, DeckCardConfig>
}

/** Un jeu prêt à l'emploi : cartes calculées, textes complétés (`{cards}`), police résolue. */
export interface Game extends GameBase {
  /** Police du nom ; `url` est l'adresse du fichier embarqué, s'il y en a un. */
  font?: FontConfig & { url?: string }
  card_groups: CardGroup[]
  /** Facultatif : l'écran « Compter les points » (après « Un tour », et depuis la saisie des scores). */
  points?: Points
  tutorial: Tutorial
}
