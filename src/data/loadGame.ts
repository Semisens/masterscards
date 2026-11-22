import { fill } from '../core/format.ts'
import { RANKS } from '../core/cards.ts'
import { expandCards, toRank } from './deck.ts'
import type {
  CardGroup,
  CardGroupConfig,
  CardSet,
  CardSetConfig,
  DeckCard,
  DeckCardConfig,
  DiagramItem,
  DiagramItemConfig,
  DisplayCard,
  Game,
  GameConfig,
  PointsRow,
  PointsRowConfig,
  TurnReveal,
} from './types.ts'

/** Remplace `{cards}` (nombre de cartes gardées) dans tous les textes. Les autres `{…}` (`{round}`) restent. */
function fillTexts<T>(value: T, values: Record<string, number>): T {
  if (typeof value === 'string') return fill(value, values) as T
  if (Array.isArray(value)) return value.map((item: unknown) => fillTexts(item, values)) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillTexts(item, values)])) as T
  return value
}

const loadCard = ({ rank, suit }: DeckCardConfig): DeckCard => ({ rank: toRank(rank), suit })

/** Un élément de la table prêt à l'emploi : les cartes visibles (si elles sont données) ont un vrai rang. */
function loadDiagramItem({ label, layout, card, cards, slots, aside }: DiagramItemConfig): DiagramItem {
  return {
    label,
    ...(layout ? { layout } : {}),
    ...(card ? { card: loadCard(card) } : {}),
    ...(cards ? { cards: cards.map(loadCard) } : {}),
    ...(slots ? { slots } : {}),
    ...(aside ? { aside } : {}),
  }
}

/** Les cartes retournées d'« Un tour », avec un vrai rang. */
function loadTurnReveal({ hand, across, center, played }: TurnReveal<DeckCardConfig>): TurnReveal {
  return {
    ...(hand ? { hand: hand.map(loadCard) } : {}),
    ...(across ? { across: loadCard(across) } : {}),
    ...(center ? { center: center.map(loadCard) } : {}),
    ...(played
      ? {
          played: {
            ...(played.across ? { across: loadCard(played.across) } : {}),
            ...(played.left ? { left: loadCard(played.left) } : {}),
            ...(played.right ? { right: loadCard(played.right) } : {}),
            ...(played.you ? { you: loadCard(played.you) } : {}),
          },
        }
      : {}),
  }
}

/** Des cartes prêtes à l’emploi (groupe ou ligne de points) : cartes exactes, jokers, rangs, nombre, carte montrée. */
export function loadCardSet(set: CardSetConfig): CardSet {
  const cards = expandCards(set.cards ?? [])
  const jokers = set.jokers ?? 0
  const ranks = RANKS.filter((rank) => cards.some((card) => card.rank === rank))
  const display: DisplayCard = !set.display
    ? (cards[0] ?? { joker: true })
    : 'joker' in set.display
      ? { joker: true }
      : { rank: toRank(set.display.rank), suit: set.display.suit }
  return { cards, jokers, ranks, count: cards.length + jokers, display }
}

/** Une ligne de « Compter les points » prête à l’emploi. */
function loadPointsRow(row: PointsRowConfig): PointsRow {
  return { ...row, ...loadCardSet(row) }
}

/** Un groupe de cartes prêt à l’emploi : cartes exactes, jokers, rangs, nombre de cartes, carte montrée. */
export function loadCardGroup(
  group: CardGroupConfig,
  assetUrl: (file: string) => string | undefined = () => undefined,
): CardGroup {
  const originals = group.expert.cards?.map((card) => ({
    ...card,
    ...(card.image ? { imageUrl: assetUrl(card.image) } : {}),
  }))
  const expert = originals ? { ...group.expert, cards: originals } : group.expert
  return { ...group, expert, ...loadCardSet(group) }
}

/**
 * Prépare un jeu à partir de sa configuration (`game.yaml`) : cartes exactes et nombre de cartes de chaque groupe
 * (et de chaque ligne de « Compter les points »), carte montrée, `{cards}` remplacé dans les textes, adresse du fichier de police.
 * La configuration est supposée valide (schéma vérifié par `src/data/games.test.ts`).
 * @param assetUrl adresse d'un fichier du dossier du jeu (police), ou `undefined` s'il n'existe pas.
 */
export function loadGame(config: GameConfig, assetUrl: (file: string) => string | undefined = () => undefined): Game {
  const card_groups = config.card_groups.map((group) => loadCardGroup(group, assetUrl))
  const total = card_groups.reduce((sum, group) => sum + group.count, 0)
  const { font, points, ...rest } = fillTexts(config, { cards: total })
  const { reveal, ...turn } = rest.tutorial.turn
  return {
    ...rest,
    ...(font ? { font: { ...font, url: font.file ? assetUrl(font.file) : undefined } } : {}),
    card_groups: card_groups.map((group) => fillTexts(group, { cards: total })),
    ...(points ? { points: { ...points, rows: points.rows.map(loadPointsRow) } } : {}),
    tutorial: {
      ...rest.tutorial,
      setup: {
        ...rest.tutorial.setup,
        hand: loadDiagramItem(rest.tutorial.setup.hand),
        center: rest.tutorial.setup.center.map(loadDiagramItem),
      },
      turn: {
        ...turn,
        ...(reveal ? { reveal: loadTurnReveal(reveal) } : {}),
      },
    },
  }
}
