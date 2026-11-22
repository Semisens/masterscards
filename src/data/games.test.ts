import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'
import schema from '../content/game.schema.json'
import { isRedSuit } from '../core/cards.ts'
import { contrastRatio, MIN_CONTRAST, pickTextColor } from '../core/contrast.ts'
import { FULL_DECK, deckPlan, removalList } from './deck.ts'
import { gameConfigs, gameFiles, games, getGame, logoUrl } from './games.ts'
import { loadGame } from './loadGame.ts'
import { tokens } from '../core/tokens.generated.ts'
import { resolveGameTheme } from './theme.ts'
import type { CardGroup, Game, GameConfig } from './types.ts'

// ---------------------------------------------------------------------------------------------------------

/** Le groupe montre-t-il une carte rouge ? Un joker est noir. */
const isRedGroup = (group: CardGroup): boolean => 'suit' in group.display && isRedSuit(group.display.suit)
// Aides de relecture éditoriale (testées plus bas, pour prouver qu'elles détectent bien ce qu'elles doivent)
// ---------------------------------------------------------------------------------------------------------

/** Minuscules et sans accents, pour comparer des mots sans se soucier de la casse ni des accents. */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Termes interdits trouvés dans un texte (mots entiers). */
export function forbiddenTermsIn(text: string, terms: string[]): string[] {
  const haystack = normalize(text)
  return terms.filter((term) => new RegExp(`(^|[^a-z0-9])${normalize(term)}([^a-z0-9]|$)`).test(haystack))
}

/** Marques du vouvoiement : le cahier des charges impose le tutoiement. */
export function voussoiementIn(text: string): string[] {
  return normalize(text).match(/\b(vous|votre|vos)\b/g) ?? []
}

const MAX_WORDS_PER_SENTENCE = 22

/** Phrases trop longues (le cahier des charges demande des phrases courtes). */
export function longSentencesIn(text: string): string[] {
  return text
    .split(/[.!?…:;]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).filter(Boolean).length > MAX_WORDS_PER_SENTENCE)
}

/** Tous les textes que le mode classique affiche (tout, sauf la ligne « pouvoir d'origine » du mode connaisseur). */
const classicTexts = (game: Game): string[] => [
  game.name,
  game.tagline,
  game.description,
  ...game.card_groups.flatMap((g) => [g.label, g.short, g.badge ?? '', g.detail.title, g.detail.text]),
  game.tutorial.setup.title,
  game.tutorial.setup.hand.label,
  ...game.tutorial.setup.center.map((item) => item.label),
  ...game.tutorial.setup.steps,
  game.tutorial.turn.title,
  ...game.tutorial.turn.steps.flatMap((s) => [s.label, s.text]),
  game.tutorial.turn.win.title,
  game.tutorial.turn.win.text,
  ...game.full_rules.flatMap((s) => [s.title, s.text]),
  game.points?.intro ?? '',
  ...(game.points?.rows ?? []).flatMap((row) => [row.label, row.short ?? '']),
]
const allTexts = (game: Game): string[] => [
  ...classicTexts(game),
  ...game.card_groups.flatMap((g) => [g.expert.original, g.expert.power ?? '']),
  ...(game.points?.rows ?? []).map((row) => row.expert ?? ''),
]

// ---------------------------------------------------------------------------------------------------------

const ajv = new Ajv2020({ allErrors: true, strict: true })
const validate = ajv.compile(schema)

const template = Object.values(
  import.meta.glob<GameConfig>('../../docs/modele-jeu.yaml', { eager: true, import: 'default' }),
)[0]

describe('aides de relecture', () => {
  it('détectent un terme interdit, quelle que soit la casse ou l’accent', () => {
    expect(forbiddenTermsIn('Le Trio gagne.', ['trio'])).toEqual(['trio'])
    expect(forbiddenTermsIn('Mode PIQUANT', ['piquant'])).toEqual(['piquant'])
    expect(forbiddenTermsIn('Mode Pîquant', ['piquant'])).toEqual(['piquant'])
  })

  it('ne confondent pas un mot avec un autre qui le contient', () => {
    expect(forbiddenTermsIn('Un trio de rois', ['rio'])).toEqual([])
    expect(forbiddenTermsIn('Un concerto', ['trio'])).toEqual([])
  })

  it('détectent le vouvoiement', () => {
    expect(voussoiementIn('Vous retournez votre carte.')).toHaveLength(2)
    expect(voussoiementIn('Tu retournes ta carte.')).toEqual([])
  })

  it('détectent les phrases trop longues', () => {
    const long = Array.from({ length: MAX_WORDS_PER_SENTENCE + 1 }, () => 'mot').join(' ')
    expect(longSentencesIn(`Court. ${long}.`)).toHaveLength(1)
    expect(longSentencesIn('Court. Encore court : deux parties.')).toEqual([])
  })

  it('le schéma refuse un jeu incomplet', () => {
    expect(validate({ id: 'x' })).toBe(false)
  })

  it('le schéma accepte un groupe de jokers, et refuse un groupe sans carte ni joker', () => {
    const base = structuredClone(template)
    const group = base.card_groups[0] as unknown as Record<string, unknown>
    const jokers = { ...group, cards: undefined, jokers: 2, display: { joker: true } }
    expect(validate({ ...base, card_groups: [jokers] }), JSON.stringify(validate.errors)).toBe(true)
    expect(validate({ ...base, card_groups: [{ ...group, cards: undefined }] })).toBe(false)
    expect(validate({ ...base, card_groups: [{ ...jokers, jokers: 5 }] })).toBe(false)
    expect(validate({ ...base, card_groups: [{ ...jokers, jokers: 0 }] })).toBe(false)
  })
})

// Le modèle à copier pour ajouter un jeu doit rester valide et jouable tel quel.
describe('modèle de jeu (docs/modele-jeu.yaml)', () => {
  const config = Object.values(
    import.meta.glob<GameConfig>('../../docs/modele-jeu.yaml', { eager: true, import: 'default' }),
  )[0]

  it('respecte le schéma', () => {
    expect(validate(config), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('se charge sans code en plus', () => {
    const game = loadGame(config)
    expect(game.card_groups.length).toBeGreaterThan(0)
    expect(deckPlan(game).keptTotal).toBeGreaterThan(0)
    expect(JSON.stringify(game)).not.toContain('{cards}')
  })
})

describe('liste des jeux', () => {
  it('contient au moins un jeu', () => {
    expect(games.length).toBeGreaterThan(0)
  })

  it('a des identifiants uniques', () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length)
  })

  it('retrouve un jeu par son id', () => {
    expect(getGame('trio')?.name).toBe('Trio')
    expect(getGame('inconnu')).toBeUndefined()
    expect(getGame(undefined)).toBeUndefined()
  })
})

describe('dossiers des jeux', () => {
  it('ont tous un game.yaml (aucun autre fichier de configuration)', () => {
    // Tous les fichiers des dossiers de jeux, quelle que soit leur extension.
    const files = Object.keys(import.meta.glob('../content/games/*/*', { query: '?url' }))
    const dirs = [...new Set(files.map((file) => file.split('/')[3]))]
    expect(gameFiles.toSorted()).toEqual(dirs.map((dir) => `../content/games/${dir}/game.yaml`).toSorted())
  })
})

describe.each(games.map((game) => [game.id, game] as const))('jeu « %s »', (id, game) => {
  const config = gameConfigs.find((c) => c.id === id)!

  it('respecte le schéma (game.schema.json)', () => {
    const ok = validate(config)
    expect(ok, JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('a un id égal au nom de son dossier', () => {
    expect(gameFiles.find((f) => f.includes(`/games/${id}/`))).toBe(`../content/games/${id}/game.yaml`)
  })

  it('a une police qui existe, s’il en déclare une', () => {
    if (game.font?.file) expect(game.font.url, `police ${game.font.file} introuvable`).toBeTruthy()
  })

  it('remplace {cards} dans tous les textes', () => {
    expect(JSON.stringify(game)).not.toContain('{cards}')
  })

  it('a un score visé pour chaque nombre de joueurs, s’il en donne une table', () => {
    const { target } = game.scoring
    if (target && typeof target === 'object')
      for (let n = game.players.min; n <= game.players.max; n++) expect(target[String(n)], `${n} joueurs`).toBeDefined()
  })

  it('a un nombre de joueurs cohérent', () => {
    expect(game.players.min).toBeLessThanOrEqual(game.players.max)
  })

  it('a un logo qui existe, s’il en déclare un', () => {
    if (game.logo) expect(logoUrl(game), `logo ${game.logo} introuvable`).toBeTruthy()
  })

  describe('groupes de cartes', () => {
    it('ne gardent jamais deux fois la même carte', () => {
      const cards = game.card_groups.flatMap((g) => g.cards).map((c) => `${c.rank}-${c.suit}`)
      expect(new Set(cards).size).toBe(cards.length)
    })

    it('ont des noms différents (une page de la vue à balayer chacun)', () => {
      const labels = game.card_groups.map((g) => g.label)
      expect(new Set(labels).size).toBe(labels.length)
    })

    it('montrent une carte qui fait partie du groupe', () => {
      for (const group of game.card_groups) {
        if ('joker' in group.display) expect(group.jokers, group.label).toBeGreaterThan(0)
        else expect(group.cards, group.label).toContainEqual(group.display)
      }
    })

    it('ne demandent pas plus de jokers qu’un paquet de 54 cartes n’en a (2)', () => {
      expect(deckPlan(game).keptJokers).toBeLessThanOrEqual(2)
    })

    it('tiennent dans un paquet de 52 cartes, jokers en plus', () => {
      const plan = deckPlan(game)
      expect(plan.keptTotal).toBeGreaterThan(0)
      expect(plan.keptTotal - plan.keptJokers).toBeLessThanOrEqual(FULL_DECK)
      expect(plan.keptTotal - plan.keptJokers + plan.removedTotal).toBe(FULL_DECK)
    })

    it('donnent à chacun son pendant dans le jeu d’origine (mode connaisseur)', () => {
      for (const group of game.card_groups) expect(group.expert.original.trim(), group.label).not.toBe('')
    })
  })

  describe('compter les points (écran facultatif)', () => {
    const rows = game.points?.rows ?? []
    const key = (c: { rank: string; suit: string }) => `${c.rank}-${c.suit}`

    it('donne une valeur à chaque carte gardée, une seule fois', () => {
      if (!game.points) return
      const counted = rows.flatMap((row) => row.cards).map(key)
      const kept = game.card_groups.flatMap((g) => g.cards).map(key)
      expect(new Set(counted).size, 'carte comptée deux fois').toBe(counted.length)
      expect([...counted].sort()).toEqual([...kept].sort())
      expect(rows.reduce((sum, row) => sum + row.jokers, 0)).toBe(deckPlan(game).keptJokers)
    })

    it('a des lignes aux noms différents, qui montrent une de leurs cartes', () => {
      expect(new Set(rows.map((row) => row.label)).size).toBe(rows.length)
      for (const row of rows) {
        if ('joker' in row.display) expect(row.jokers, row.label).toBeGreaterThan(0)
        else expect(row.cards, row.label).toContainEqual(row.display)
      }
    })
  })

  describe('thème', () => {
    it('a un contraste texte / fond d’au moins 4,5', () => {
      const theme = resolveGameTheme(game)
      expect(contrastRatio(theme.main, theme.text)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })

    it('a un texte lisible sur tout le fond des écrans, s’il en donne un', () => {
      const { screen } = resolveGameTheme(game)
      if (!screen) return
      for (const end of [screen.base, screen.from, screen.to])
        expect(contrastRatio(end, screen.text), end).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })

    it('a un dos de carte visible sur le blanc des cartes et sur la couleur du jeu', () => {
      const { cardBack } = resolveGameTheme(game)
      expect(cardBack).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  describe('cartes d’origine (mode connaisseur)', () => {
    const originals = game.card_groups.flatMap((g) => g.expert.cards ?? [])

    it('ont une couleur où la valeur se lit (blanc ou encre, contraste ≥ 4,5)', () => {
      for (const card of originals) expect(pickTextColor(card.color), `${card.value} ${card.color}`).not.toBeNull()
    })

    it('ont une image qui existe, s’il y en a une', () => {
      for (const card of originals) if (card.image) expect(card.imageUrl, `image ${card.image}`).toBeTruthy()
    })

    it('ne repètent aucune valeur d’un groupe à l’autre', () => {
      const values = originals.map((c) => c.value)
      expect(new Set(values).size).toBe(values.length)
    })

    it('sont toutes données, ou aucune : un jeu ne mélange pas dessin et pointillés', () => {
      const withCards = game.card_groups.filter((g) => g.expert.cards).length
      expect([0, game.card_groups.length]).toContain(withCards)
    })
  })

  describe('schémas de cartes de dos', () => {
    it('ne posent des cartes de dos que si le jeu n’y met pas une carte visible', () => {
      const { hand, center } = game.tutorial.setup
      for (const item of [hand, ...center]) {
        if (item.card || item.cards) expect(item.layout, item.label).toBeUndefined()
        expect(item.card && item.cards, item.label).toBeFalsy()
        if (item.slots) expect(item.cards, item.label).toBeDefined()
      }
    })

    it('ne retourne dans « Un tour » que des cartes de la table de la mise en place', () => {
      const { setup, turn } = game.tutorial
      expect(turn.reveal?.center?.length ?? 0).toBeLessThanOrEqual(setup.center.length)
      // Une carte retournée au centre : il y a des dos à cet endroit, pas déjà une carte visible.
      turn.reveal?.center?.forEach((_, index) => {
        expect(setup.center[index].card, setup.center[index].label).toBeUndefined()
        expect(setup.center[index].cards, setup.center[index].label).toBeUndefined()
      })
      if (turn.reveal?.hand) expect(setup.hand.card).toBeUndefined()
    })

    it('jeux de plis : ta carte prête à jouer va avec ta main, et une carte du pli n’est pas aussi posée à côté', () => {
      const reveal = game.tutorial.turn.reveal
      if (reveal?.next) expect(reveal.hand, 'next sans hand').toBeDefined()
      for (const seat of ['across', 'left', 'right'] as const)
        if (reveal?.trick?.[seat]) expect(reveal.played?.[seat], seat).toBeUndefined()
    })
  })

  describe('vocabulaire', () => {
    it('évite les termes d’origine que le jeu interdit en mode classique', () => {
      const terms = game.classic_forbidden_terms ?? []
      const found = classicTexts(game).flatMap((text) => forbiddenTermsIn(text, terms))
      expect(found).toEqual([])
    })
  })

  describe('ton', () => {
    it('tutoie partout', () => {
      expect(allTexts(game).flatMap(voussoiementIn)).toEqual([])
    })

    it('utilise des phrases courtes', () => {
      expect(allTexts(game).flatMap(longSentencesIn)).toEqual([])
    })
  })
})

describe('Trio', () => {
  const trio = getGame('trio')!
  const plan = deckPlan(trio)

  it('regroupe les cartes comme la maquette : 6 lignes', () => {
    expect(trio.card_groups.map((g) => g.label)).toEqual(['A', '2 à 6', '7', '8 à 10', 'Valet', 'Dame'])
    expect(trio.card_groups.map((g) => g.count)).toEqual([3, 15, 3, 9, 3, 3])
  })

  it('garde 36 cartes : on retire les carreaux et les rois', () => {
    expect(plan.keptTotal).toBe(36)
    expect(plan.removedTotal).toBe(16)
    expect(plan.removedSuits).toEqual(['diamonds'])
    expect(plan.removedRanks).toEqual(['K'])
    expect(plan.keptSuits).toEqual(['spades', 'hearts', 'clubs'])
    expect(removalList(plan)).toBe('les carreaux et les rois')
    expect(plan.removalMode).toBe('list')
  })

  it('numérote les valeurs d’origine de 1 à 12', () => {
    expect(trio.card_groups.map((g) => g.expert.original)).toEqual(['1', '2–6', '7', '8–10', '11', '12'])
  })

  it('met en avant le 7 : pastille « Spécial » et pouvoir d’origine', () => {
    const seven = trio.card_groups.find((g) => g.label === '7')!
    expect(seven.badge).toBe('Spécial')
    expect(seven.expert.power).toMatch(/victoire/)
    expect(trio.card_groups.filter((g) => g.badge)).toHaveLength(1)
  })

  it('alterne cartes rouges et noires dans la liste, comme la maquette', () => {
    const reds = trio.card_groups.map((g) => isRedGroup(g))
    expect(reds).toEqual([true, false, true, false, true, false])
  })

  it('dessine les 12 cartes d’origine, de 1 à 12, une couleur chacune', () => {
    const originals = trio.card_groups.flatMap((g) => g.expert.cards ?? [])
    expect(originals.map((c) => c.value)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    expect(trio.card_groups.map((g) => g.expert.cards?.length)).toEqual([1, 5, 1, 3, 1, 1])
  })

  it('montre ses cartes d’origine en images découpées de la planche, une par carte, fichiers présents', () => {
    const originals = trio.card_groups.flatMap((g) => g.expert.cards ?? [])
    expect(originals.map((c) => c.image)).toEqual(
      Array.from({ length: 12 }, (_, i) => `carte-${String(i + 1).padStart(2, '0')}.webp`),
    )
    for (const card of originals) expect(card.imageUrl, card.image).toBeTruthy()
  })

  it('garde le bleu de l’app (pas de fond propre) et pose une main en éventail, le centre en cartes alignées', () => {
    expect(resolveGameTheme(trio).screen).toBeUndefined()
    expect(trio.tutorial.setup.hand.layout).toBe('spread')
    expect(trio.tutorial.setup.center.map((i) => i.layout)).toEqual(['grid'])
  })

  it('retourne dans « Un tour » une carte du centre (un 4) et la carte du bord de la main d’en face (un as)', () => {
    expect(trio.tutorial.turn.reveal).toEqual({
      across: { rank: 'A', suit: 'spades' },
      center: [{ rank: '4', suit: 'hearts' }],
    })
  })

  it('se joue de 3 à 6 joueurs, en 15 minutes', () => {
    expect(trio.players).toEqual({ min: 3, max: 6 })
    expect(trio.duration_min).toBe(15)
  })

  it('répartit les 36 cartes entre joueurs et centre pour chaque effectif', () => {
    // Mise en place d'origine : [joueurs, cartes par joueur, cartes au centre].
    const setups: Array<[number, number, number]> = [
      [3, 9, 9],
      [4, 7, 8],
      [5, 6, 6],
      [6, 5, 6],
    ]
    for (const [players, each, center] of setups) expect(players * each + center).toBe(36)
    // Les textes citent ces nombres : 9, 7, 6 ou 5 cartes par joueur.
    const text = [...trio.tutorial.setup.steps, ...trio.full_rules.map((s) => s.text)].join(' ')
    expect(text).toContain('9, 7, 6 ou 5 cartes')
  })

  it('reprend les textes de la maquette mot pour mot', () => {
    expect(trio.tagline).toBe('Trouve trois cartes identiques.')
    expect(trio.tutorial.turn.win.text).toBe('Réunis 3 trios. Ou le trio de 7.')
    expect(trio.tutorial.setup.hand.label).toBe('Ta main, triée')
    expect(trio.tutorial.setup.center.map((item) => item.label)).toEqual(['Au centre, cachées'])
    expect(trio.full_rules.map((s) => s.title)).toEqual([
      'But',
      'Mise en place',
      'Un tour',
      'Trio',
      'Cartes différentes',
      'Mode piquant',
    ])
  })

  it('ne laisse aucun texte provisoire de la maquette', () => {
    expect(allTexts(trio).join('\n')).not.toMatch(/à détailler|\[|\]/i)
  })

  it('se termine seule au troisième trio, quel que soit le nombre de joueurs', () => {
    expect(trio.scoring.target).toBe(3)
    expect(trio.scoring.party_label).toBe('Trios gagnés')
  })

  it('annonce 36 cartes dans la mise en place, comme le paquet', () => {
    expect(trio.tutorial.setup.steps[0]).toBe('Mélange les 36 cartes.')
    expect(trio.full_rules[1].text).toMatch(/^36 cartes\./)
  })
})

describe('Love Letter', () => {
  const ll = getGame('love-letter')!
  const plan = deckPlan(ll)

  it('regroupe les cartes comme la règle : 10 personnages, les jokers en premier', () => {
    expect(ll.card_groups.map((g) => g.label)).toEqual([
      'Jokers',
      'Valets et rois noirs',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      'Dame de cœur',
    ])
    expect(ll.card_groups.map((g) => g.count)).toEqual([2, 6, 2, 2, 2, 2, 2, 1, 1, 1])
  })

  it('garde 21 cartes : 2 jokers, 6 Gardes (4 valets, 2 rois noirs) et 13 autres', () => {
    expect(plan.keptTotal).toBe(21)
    expect(plan.keptJokers).toBe(2)
    const guards = ll.card_groups[1].cards
    expect(guards.filter((c) => c.rank === 'J')).toHaveLength(4)
    expect(guards.filter((c) => c.rank === 'K').map((c) => c.suit)).toEqual(['spades', 'clubs'])
  })

  it('prend les jokers pour Espionnes et la dame de cœur pour Princesse', () => {
    const [spies] = ll.card_groups
    expect(spies.jokers).toBe(2)
    expect(spies.cards).toEqual([])
    expect(spies.display).toEqual({ joker: true })
    expect(ll.card_groups.at(-1)!.cards).toEqual([{ rank: 'Q', suit: 'hearts' }])
  })

  it('prend un rang par valeur de 2 à 8, comme la règle', () => {
    expect(ll.card_groups.slice(2, 9).map((g) => g.ranks)).toEqual([['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8']])
  })

  it('dit « Retire tout le reste » : les cartes gardées ne forment pas des couleurs et valeurs entières', () => {
    expect(plan.removalMode).toBe('keepOnly')
  })

  it('numérote les personnages d’origine de 0 à 9, avec leur nom', () => {
    expect(ll.card_groups.map((g) => g.expert.original)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(ll.card_groups.map((g) => g.expert.name)).toEqual([
      'Espionne',
      'Garde',
      'Prêtre',
      'Baron',
      'Servante',
      'Prince',
      'Chancelier',
      'Roi',
      'Comtesse',
      'Princesse',
    ])
  })

  it('alterne cartes noires et rouges dans la liste', () => {
    expect(ll.card_groups.map((g) => isRedGroup(g))).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
    ])
  })

  it('se joue en manches, jusqu’à 6, 5, 4, 3 ou 3 points selon 2 à 6 joueurs', () => {
    expect(ll.scoring.party_label).toBe('Manche {round}')
    expect(ll.scoring.target).toEqual({ '2': 6, '3': 5, '4': 4, '5': 3, '6': 3 })
    expect(ll.players).toEqual({ min: 2, max: 6 })
    expect(ll.duration_min).toBe(20)
  })

  it('reprend les textes de la maquette', () => {
    expect(ll.tagline).toBe('Une lettre. Une princesse. Un seul gagnant.')
    expect(ll.tutorial.turn.win.title).toBe('Gagner la manche')
    expect(ll.tutorial.setup.hand.label).toBe('Ta main')
    expect(ll.tutorial.setup.center.map((item) => item.label)).toEqual(['Pioche', 'Écartée, cachée'])
    expect(ll.full_rules.map((s) => s.title)).toEqual([
      'But',
      'Valeurs des cartes',
      'Mise en place',
      'Un tour',
      'Fin de manche',
      'Jokers',
    ])
  })

  it('dit le comptage des points de la règle : 1 point, 2 au plus avec les jokers', () => {
    const rules = ll.full_rules.map((s) => s.text).join('\n')
    expect(rules).toMatch(/6 points à 2 joueurs, 5 à 3 joueurs, 4 à 4 joueurs, 3 à 5 ou 6 joueurs/)
    expect(rules).toMatch(/2 points au plus/)
    expect(rules).not.toMatch(/additionn/)
  })

  it('n’a aucune mise en place particulière à 2 joueurs', () => {
    const texts = [...ll.tutorial.setup.steps, ...ll.full_rules.map((s) => s.text)].join('\n')
    expect(texts).not.toMatch(/face visible au début|À 2 joueurs, pose/)
    expect(ll.tutorial.setup.center.every((item) => !item.card)).toBe(true)
  })

  it('prend la palette bordeaux : couleur du jeu, relief, texte et fond crème, dos corail, sceau de cire pour logo', () => {
    const theme = resolveGameTheme(ll)
    expect(theme.main).toBe('#812B2B')
    expect(theme.shadow).toBe('#400E0E')
    expect(theme.text).toBe('#EEDDC8')
    expect(theme.screen?.base).toBe('#EEDDC8')
    expect(theme.screen?.text).toBe(tokens.colors.encre)
    expect(theme.cardBack).toBe('#E57979')
    expect(ll.logo).toBe('logo.svg')
    expect(logoUrl(ll)).toBeTruthy()
  })

  it('dessine les 10 cartes d’origine, de 0 à 9, avec leur nom', () => {
    const originals = ll.card_groups.flatMap((g) => g.expert.cards ?? [])
    expect(originals.map((c) => c.value)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(originals.map((c) => c.name)).toEqual(ll.card_groups.map((g) => g.expert.name))
  })

  it('montre une carte par main, la pioche en pile, la carte écartée seule ; dans « Un tour », ta main de 2 cartes de face et une carte jouée devant les joueurs d’en face et de droite', () => {
    expect(ll.tutorial.setup.hand.layout).toBe('single')
    expect(ll.tutorial.setup.center.map((i) => i.layout)).toEqual(['pile', 'single'])
    expect(ll.tutorial.turn.reveal).toEqual({
      hand: [
        { rank: '5', suit: 'hearts' },
        { rank: 'Q', suit: 'hearts' },
      ],
      played: {
        across: { rank: '3', suit: 'spades' },
        right: { rank: 'J', suit: 'clubs' },
      },
    })
  })

  it('annonce 21 cartes dans la mise en place, comme le paquet', () => {
    expect(ll.tutorial.setup.steps[0]).toBe('Mélange les 21 cartes.')
  })

  it('ne laisse aucun texte provisoire de la maquette', () => {
    expect(allTexts(ll).join('\n')).not.toMatch(/\[|\]/)
  })

  it('écrit « Carte 2 / 10 » dans la vue à balayer', () => {
    expect(ll.group_word).toBe('Carte')
  })
})

describe('6 qui prend', () => {
  const six = getGame('6-qui-prend')!
  const plan = deckPlan(six)

  it('garde tout le paquet de 52 et les 2 jokers : 54 cartes, rien à retirer', () => {
    expect(plan.keptTotal).toBe(54)
    expect(plan.keptJokers).toBe(2)
    expect(plan.removedTotal).toBe(0)
  })

  it('montre l’ordre de force dans « Tes cartes » : une ligne par couleur, puis les jokers', () => {
    expect(six.card_groups.map((g) => g.label)).toEqual(['Trèfle', 'Pique', 'Carreau', 'Cœur', 'Jokers'])
    expect(six.card_groups.map((g) => g.count)).toEqual([13, 13, 13, 13, 2])
    expect(six.card_groups.slice(0, 4).map((g) => g.cards[0].suit)).toEqual(['clubs', 'spades', 'diamonds', 'hearts'])
    // Plus de points dans « Tes cartes » : ils sont sur « Compter les points ».
    for (const group of six.card_groups) expect(group.short, group.label).not.toMatch(/point/)
  })

  it('compte les points : dame de pique 7, rois 5, 10 3, 5 2, les autres (jokers compris) 1', () => {
    const rows = six.points?.rows ?? []
    expect(rows.map((row) => [row.label, row.count, row.points])).toEqual([
      ['Dame de pique', 1, 7],
      ['Les rois', 4, 5],
      ['Les 10', 4, 3],
      ['Les 5', 4, 2],
      ['Toutes les autres', 41, 1],
    ])
    expect(rows[0].cards).toEqual([{ rank: 'Q', suit: 'spades' }])
  })

  it('ne dit plus « dans l’ordre croissant » dans sa présentation', () => {
    expect(six.description).not.toMatch(/ordre croissant/)
  })

  it('se joue de 2 à 5 joueurs : 10 cartes chacun et 4 rangées tiennent dans 54 cartes', () => {
    expect(six.players).toEqual({ min: 2, max: 5 })
    expect(10 * six.players.max + 4).toBeLessThanOrEqual(plan.keptTotal)
  })

  it('s’arrête à 66 points, et le plus petit score gagne', () => {
    expect(six.scoring.target).toBe(66)
    expect(six.scoring.lowest_wins).toBe(true)
  })

  it('pose les 4 rangées au centre de la table : une carte de face, puis 4 places vides', () => {
    expect(six.tutorial.setup.center).toHaveLength(1)
    expect(six.tutorial.setup.center[0].cards).toHaveLength(4)
    expect(six.tutorial.setup.center[0].slots).toBe(5)
  })

  it('montre dans « Un tour » une carte posée à côté de chacune des quatre mains, la tienne comprise', () => {
    expect(Object.keys(six.tutorial.turn.reveal?.played ?? {}).sort()).toEqual(['across', 'left', 'right', 'you'])
  })

  it('dit la règle des deux jokers : chi-fou-prend, le perdant ramasse', () => {
    const rules = six.full_rules.map((s) => s.text).join('\n')
    expect(rules).toMatch(/53 et 54/)
    expect(rules).toMatch(/chi-fou-prend/)
    expect(rules).toMatch(/perdant ramasse/)
  })
})
