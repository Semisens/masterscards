import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

// Fidélité aux maquettes : chaque écran de l'app est comparé, pixel par pixel, à l'image de sa maquette
// (maquettes/<jeu>/*.png, produites par `npm run maquettes`). Les images d'écart sont écrites dans
// test-results/maquettes/ (rouge = pixels différents) : on peut les regarder même quand le test passe.

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Screen {
  /** Jeu de la maquette : dossier `maquettes/<jeu>/` et partie mémorisée sous ce nom. */
  game?: string
  /** Nom du fichier de la maquette, sans extension. */
  name: string
  url: string
  /** Part maximale de pixels différents (0 à 1). */
  max: number
  /** Zones ignorées (en pixels CSS, base 390 x 844) : écarts voulus et expliqués. */
  masks?: Rect[]
  /** Pourquoi ces zones sont ignorées. */
  why?: string
  mode?: 'classic' | 'expert'
  /** Partie en cours à charger dans l'app. */
  party?: Party
  /** Parties passées à charger dans l'historique. */
  history?: unknown[]
  /** Gestes à faire avant la capture (la maquette montre un état qu'on n'a pas au chargement). */
  act?: (page: Page) => Promise<void>
}

interface Party {
  players: Array<{ name: string; score: number }>
  round: number
}

// États de l'app qui correspondent à ce que montre chaque maquette (elles ne montrent pas les mêmes scores).
const PARTY: Party = {
  players: [
    { name: 'Léa', score: 2 },
    { name: 'Tom', score: 1 },
    { name: 'Inès', score: 0 },
  ],
  round: 3,
}
/** La saisie part de zéro pour tous les jeux ; les maquettes montrent « Léa 1 » : on fait le geste. */
const ONE_FOR_LEA = async (page: Page) => {
  await page.getByRole('button', { name: /de plus pour Léa/ }).click()
}

// Écarts voulus, tous expliqués. Tout le reste doit correspondre à la maquette.
/** Texte du « Mode piquant » : la maquette contient un « [À détailler] » qu'on ne peut pas publier. */
const PIQUANT_TEXT: Rect = { x: 24, y: 700, w: 342, h: 115 }
/** Boutons « − » d'un score à zéro : désactivés dans l'app (on ne descend pas sous 0), actifs dans la maquette. */
const MINUS_AT_ZERO: Rect[] = [
  { x: 204, y: 288, w: 48, h: 48 },
  { x: 204, y: 350, w: 48, h: 48 },
]

/**
 * La main (2 ou 3 cartes en éventail, cahier §7.3 et §7.4) remplace la carte seule des groupes de plusieurs rangs
 * (« 2 à 6 », « 8 à 10 »). Les lignes grandissent (la main est plus large, le titre passe parfois à la ligne) :
 * on ignore le cadre de la liste. La vue à balayer des maquettes montre le 7, une carte seule : elle n'a pas d'écart.
 */
const HAND_LIST: Rect[] = [{ x: 0, y: 215, w: 390, h: 465 }]
const HAND_WHY = 'La main de cartes remplace la carte seule : écart voulu (cahier des charges §7.10).'

const TRIO_SCREENS: Screen[] = [
  { name: '01-game-detail', url: '/jeu/trio', max: 0.005 },
  {
    name: '02-cartes-classique',
    url: '/jeu/trio/tutoriel/cartes',
    mode: 'classic',
    masks: HAND_LIST,
    why: HAND_WHY,
    max: 0.005,
  },
  {
    name: '03-cartes-connaisseur',
    url: '/jeu/trio/tutoriel/cartes',
    mode: 'expert',
    masks: HAND_LIST,
    why: HAND_WHY,
    max: 0.005,
  },
  {
    name: '04-carte-swipe',
    url: '/jeu/trio/tutoriel/cartes/3',
    mode: 'expert',
    max: 0.01,
  },
  { name: '05-mise-en-place', url: '/jeu/trio/tutoriel/mise-en-place', max: 0.005 },
  { name: '06-un-tour', url: '/jeu/trio/tutoriel/tour', max: 0.01 },
  { name: '07-regles-completes', url: '/jeu/trio/regles', masks: [PIQUANT_TEXT], max: 0.01 },
  { name: '08-partie', url: '/jeu/trio/partie', party: PARTY, max: 0.005 },
  {
    name: '09-scores',
    url: '/jeu/trio/partie/scores',
    party: PARTY,
    act: ONE_FOR_LEA,
    masks: MINUS_AT_ZERO,
    max: 0.01,
  },
]

const LL = '/jeu/love-letter'
const LOVE_LETTER_SCREENS: Screen[] = [
  { game: 'love-letter', name: '03-game-detail', url: LL, max: 0.01 },
  { game: 'love-letter', name: '04-regles-completes', url: `${LL}/regles`, max: 0.01 },
  {
    game: 'love-letter',
    name: '05-cartes-classique',
    url: `${LL}/tutoriel/cartes`,
    mode: 'classic',
    masks: HAND_LIST,
    why: HAND_WHY,
    max: 0.01,
  },
  {
    game: 'love-letter',
    name: '06-cartes-connaisseur',
    url: `${LL}/tutoriel/cartes`,
    mode: 'expert',
    masks: HAND_LIST,
    why: HAND_WHY,
    max: 0.01,
  },
  {
    game: 'love-letter',
    name: '07-carte-swipe',
    url: `${LL}/tutoriel/cartes/3`,
    mode: 'expert',
    max: 0.01,
  },
  { game: 'love-letter', name: '08-mise-en-place', url: `${LL}/tutoriel/mise-en-place`, max: 0.01 },
  // La maquette reprend la règle de l'Espionne de l'app (« seul à avoir un joker devant toi ») : plus de masque.
  { game: 'love-letter', name: '09-un-tour', url: `${LL}/tutoriel/tour`, max: 0.01 },
  { game: 'love-letter', name: '10-partie', url: `${LL}/partie`, party: PARTY, max: 0.01 },
  { game: 'love-letter', name: '11-scores', url: `${LL}/partie/scores`, party: PARTY, act: ONE_FOR_LEA, max: 0.01 },
]

const entry = (id: string, date: string, status: string, players: Array<[string, number]>, gameId = 'love-letter') => ({
  id,
  gameId,
  date,
  status,
  players: players.map(([name, score]) => ({ name, score })),
})
const PODIUM = [
  entry('1', '2026-10-12T12:00:00.000Z', 'finished', [
    ['Léa', 4],
    ['Tom', 2],
    ['Inès', 1],
    ['Sam', 0],
  ]),
]
const HISTORY = [
  entry('3', '2026-10-12T12:00:00.000Z', 'finished', [
    ['Léa', 4],
    ['Tom', 2],
    ['Inès', 0],
  ]),
  entry('2', '2026-10-03T12:00:00.000Z', 'interrupted', [
    ['Inès', 3],
    ['Tom', 1],
    ['Léa', 0],
  ]),
  entry('1', '2026-09-28T12:00:00.000Z', 'finished', [
    ['Léa', 4],
    ['Sam', 1],
    ['Tom', 0],
  ]),
  entry(
    '0',
    '2026-09-01T12:00:00.000Z',
    'finished',
    [
      ['Léa', 3],
      ['Tom', 1],
      ['Inès', 0],
    ],
    'trio',
  ),
]

const APP_SCREENS: Screen[] = [
  { game: 'love-letter', name: '02-accueil', url: '/', max: 0.01 },
  { game: 'love-letter', name: '12-podium-termine', url: `${LL}/resultat/1`, history: PODIUM, max: 0.01 },
  {
    game: 'love-letter',
    name: '13-podium-interrompu',
    url: `${LL}/resultat/1`,
    history: [{ ...PODIUM[0], status: 'interrupted' }],
    max: 0.01,
  },
  { game: 'love-letter', name: '14-historique', url: '/scores', history: HISTORY, max: 0.01 },
  { game: 'love-letter', name: '15-reglages', url: '/reglages', max: 0.01 },
]
const SCREENS = [...TRIO_SCREENS, ...LOVE_LETTER_SCREENS, ...APP_SCREENS]

const ready = async (page: Page) => {
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('700 16px Fredoka'),
      document.fonts.load('600 32px Fredoka'),
      document.fonts.load('700 16px Nunito'),
      document.fonts.load('800 16px Nunito'),
      document.fonts.load('400 64px "Great Vibes"'),
    ])
    await document.fonts.ready
  })
}

const SCALE = 2

function blank(png: PNG, rect: Rect) {
  for (let y = Math.round(rect.y * SCALE); y < Math.round((rect.y + rect.h) * SCALE); y++) {
    for (let x = Math.round(rect.x * SCALE); x < Math.round((rect.x + rect.w) * SCALE); x++) {
      const i = (y * png.width + x) * 4
      png.data[i] = png.data[i + 1] = png.data[i + 2] = 0
      png.data[i + 3] = 255
    }
  }
}

test.describe('fidélité aux maquettes', () => {
  for (const screen of SCREENS) {
    const game = screen.game ?? 'trio'
    const label = `${game}/${screen.name}`
    test(label, async ({ page }, testInfo) => {
      await page.addInitScript(
        ({ mode, party, history, game }) => {
          window.localStorage.clear()
          window.localStorage.setItem('masterscards:welcomed', '1')
          if (mode) window.localStorage.setItem('masterscards:mode', mode)
          if (party) window.localStorage.setItem(`masterscards:session:${game}`, JSON.stringify(party))
          if (history) window.localStorage.setItem('masterscards:history', JSON.stringify(history))
        },
        { mode: screen.mode, party: screen.party, history: screen.history, game },
      )
      await page.goto(screen.url)
      await ready(page)
      await screen.act?.(page)
      await page.waitForTimeout(150)

      const actual = PNG.sync.read(await page.screenshot())
      const expected = PNG.sync.read(readFileSync(`maquettes/${game}/${screen.name}.png`))
      expect([actual.width, actual.height], 'même taille que la maquette').toEqual([expected.width, expected.height])

      for (const mask of screen.masks ?? []) {
        blank(actual, mask)
        blank(expected, mask)
      }

      const diff = new PNG({ width: expected.width, height: expected.height })
      const different = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
        threshold: 0.1,
        includeAA: false,
      })
      const ratio = different / (expected.width * expected.height)

      const out = `test-results/maquettes/${game}-${screen.name}`
      mkdirSync('test-results/maquettes', { recursive: true })
      writeFileSync(`${out}-diff.png`, PNG.sync.write(diff))
      writeFileSync(`${out}-app.png`, PNG.sync.write(PNG.sync.read(await page.screenshot())))
      testInfo.annotations.push({ type: 'écart', description: `${(ratio * 100).toFixed(2)} % des pixels` })
      console.log(`${label}: ${(ratio * 100).toFixed(2)} % de pixels différents`)

      expect(
        ratio,
        `${(ratio * 100).toFixed(2)} % de pixels différents (maximum ${screen.max * 100} %)`,
      ).toBeLessThanOrEqual(screen.max)
    })
  }
})
