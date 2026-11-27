import { expect, test, type Page } from '@playwright/test'
import type { Game } from '../src/data/types.ts'
import { GAMES, NEWS_SEEN, party, unnamedParty, type Party } from './games.ts'

// Remplace les « golden tests » : captures de la page de visite du design system à 390 × 844.
// Première exécution ou changement voulu : `npm run test:visual -- --update-snapshots`, puis relire les images.
test.describe('design system', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/design-system')
    await expect(page.getByTestId('design-system')).toBeVisible()
    // Les captures dépendent des polices : on attend qu'elles soient chargées.
    await page.evaluate(async () => {
      await Promise.all([document.fonts.load('700 16px Fredoka'), document.fonts.load('600 16px Nunito')])
      await document.fonts.ready
    })
  })

  test('boutons', async ({ page }) => {
    await expect(page.locator('section[aria-labelledby="ds-buttons"]')).toHaveScreenshot('boutons.png')
  })

  test('cartes', async ({ page }) => {
    await expect(page.locator('section[aria-labelledby="ds-cards"]')).toHaveScreenshot('cartes.png')
  })

  test('jetons', async ({ page }) => {
    await expect(page.locator('section[aria-labelledby="ds-chips"]')).toHaveScreenshot('jetons.png')
  })

  test('page complète', async ({ page }) => {
    await expect(page).toHaveScreenshot('design-system.png', { fullPage: true })
  })

  test("le bouton pressé s'enfonce de la hauteur du relief", async ({ page }) => {
    const button = page.getByRole('button', { name: 'Jouer' })
    const rest = (await button.boundingBox())!
    await button.hover()
    await page.mouse.down()
    // La transition dure 80 ms.
    await page.waitForTimeout(200)
    const pressed = (await button.boundingBox())!
    await page.mouse.up()
    expect(pressed.y - rest.y).toBeGreaterThan(4)
  })

  test('toutes les cibles tactiles font au moins 44 px', async ({ page }) => {
    const buttons = page.getByRole('button')
    for (let i = 0; i < (await buttons.count()); i++) {
      const box = (await buttons.nth(i).boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('aucun texte sous 16 px', async ({ page }) => {
    const tooSmall = await page.evaluate(() => {
      const bad: string[] = []
      for (const el of document.querySelectorAll<HTMLElement>('main *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
        if (own && parseFloat(getComputedStyle(el).fontSize) < 16) bad.push(el.tagName)
      }
      return bad
    })
    // Le rang des cartes et la valeur des jetons sont des éléments graphiques à taille proportionnelle à l'objet.
    expect(tooSmall).toEqual([])
  })
})

// Écrans sans maquette (accueil au premier lancement, « Qui joue ? », À propos, erreur) : captures de non-régression à la taille de l'écran.
// Les écrans qui ont une maquette sont comparés à elle dans e2e/maquettes.spec.ts.
const ready = async (page: Page) => {
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('700 16px Fredoka'),
      document.fonts.load('600 32px Fredoka'),
      document.fonts.load('700 16px Nunito'),
      document.fonts.load('800 16px Nunito'),
    ])
    await document.fonts.ready
  })
}

const player = (name: string, score = 0) => ({ name, score })
const PARTY_6 = {
  players: [player('Léa', 2), player('Tom', 1), player('Inès'), player('Sacha'), player('Maé'), player('Noé', 3)],
  round: 1,
}

test.describe('écrans sans maquette', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('accueil, premier lancement', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Bienvenue !')).toBeVisible()
    await ready(page)
    await expect(page).toHaveScreenshot('accueil-premier-lancement.png')
  })

  test('qui joue ?', async ({ page }) => {
    await page.goto('/jeu/trio/joueurs')
    await expect(page.getByRole('heading', { name: 'Qui joue ?' })).toBeVisible()
    await ready(page)
    // La pastille est un <button> : elle doit respecter texte ≥ 16 px et zone tactile ≥ 44 px, comme un lien.
    const skip = page.getByRole('button', { name: 'Passer cette étape' })
    expect((await skip.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    expect(await skip.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16)
    await expect(page).toHaveScreenshot('qui-joue.png')
  })

  test('partie en cours à six joueurs', async ({ page }) => {
    await page.addInitScript(
      (party) => window.localStorage.setItem('masterscards:session:trio', JSON.stringify(party)),
      PARTY_6,
    )
    await page.goto('/jeu/trio/partie')
    await expect(page.getByRole('heading', { name: 'Partie en cours' })).toBeVisible()
    await ready(page)
    await expect(page).toHaveScreenshot('partie-six-joueurs.png')
  })

  test('à propos', async ({ page }) => {
    await page.goto('/a-propos')
    await expect(page.getByRole('heading', { name: 'Le principe' })).toBeVisible()
    await ready(page)
    await expect(page).toHaveScreenshot('a-propos.png')
  })

  test('jeu introuvable', async ({ page }) => {
    await page.goto('/jeu/nexiste-pas')
    await expect(page.getByText('Ce jeu n’existe pas ou n’est plus disponible.')).toBeVisible()
    await ready(page)
    await expect(page).toHaveScreenshot('introuvable.png')
  })
})

// « Chaque écran doit tenir sans défilement vertical » : vérifié sur tous les écrans de tous les jeux, à la base
// du cahier des charges (390 x 844) et au Pixel 8a (393 x 852). Les jeux sont lus dans src/content/games/ :
// un nouveau jeu est contrôlé sans modifier ce fichier.
interface Screen {
  name: string
  url: string
  mode?: 'classic' | 'expert'
  party?: Party
  /** Jeu de la partie mémorisée. */
  game?: string
  history?: unknown[]
}

const entry = (id: number, gameId: string, status: string, players = party(4).players) => ({
  id: String(id),
  gameId,
  date: `2026-10-${String(10 + (id % 18)).padStart(2, '0')}T12:00:00.000Z`,
  status,
  players,
})
/** Beaucoup de parties : la liste doit défiler dans son cadre, pas la page. */
const MANY_PARTIES = Array.from({ length: 30 }, (_, i) =>
  entry(i + 1, GAMES[i % GAMES.length].id, i % 2 ? 'finished' : 'interrupted'),
)

/** Tous les écrans d'un jeu, avec le plus petit et le plus grand nombre de joueurs. */
const gameScreens = (game: Game): Screen[] => {
  const url = `/jeu/${game.id}`
  const { min, max } = game.players
  const screens: Screen[] = [
    { name: 'le jeu', url },
    { name: 'règles complètes', url: `${url}/regles` },
    { name: 'cartes, classique', url: `${url}/tutoriel/cartes`, mode: 'classic' },
    { name: 'cartes, connaisseur', url: `${url}/tutoriel/cartes`, mode: 'expert' },
    ...game.card_groups.flatMap((_, i): Screen[] => [
      { name: `groupe ${i + 1}, classique`, url: `${url}/tutoriel/cartes/${i + 1}`, mode: 'classic' },
      { name: `groupe ${i + 1}, connaisseur`, url: `${url}/tutoriel/cartes/${i + 1}`, mode: 'expert' },
    ]),
    { name: 'mise en place', url: `${url}/tutoriel/mise-en-place` },
    // Pas « Un tour » : sa table est celle de la mise en place, à l'identique (quelques cartes retournées) ;
    // la page peut défiler au besoin (choix de l'utilisateur, cahier des charges §5).
    ...(game.points
      ? [
          { name: 'compter les points, classique', url: `${url}/tutoriel/points`, mode: 'classic' as const },
          { name: 'compter les points, connaisseur', url: `${url}/tutoriel/points`, mode: 'expert' as const },
        ]
      : []),
    { name: 'qui joue ?', url: `${url}/joueurs` },
    { name: `partie sans prénoms, ${max} joueurs`, url: `${url}/partie`, game: game.id, party: unnamedParty(max) },
    {
      name: 'qui joue ? pour noter les scores',
      url: `${url}/joueurs?depuis=partie`,
      game: game.id,
      party: unnamedParty(max),
    },
    ...[...new Set([min, max])].flatMap((n): Screen[] => [
      { name: `partie, ${n} joueurs`, url: `${url}/partie`, game: game.id, party: party(n) },
      { name: `scores, ${n} joueurs`, url: `${url}/partie/scores`, game: game.id, party: party(n) },
    ]),
    {
      name: `podium, ${max} joueurs`,
      url: `${url}/resultat/1`,
      history: [entry(1, game.id, 'finished', party(max).players)],
    },
  ]
  return screens.map((screen) => ({ ...screen, name: `${game.name} : ${screen.name}` }))
}

const SCREENS: Screen[] = [
  { name: 'accueil', url: '/' },
  { name: 'à propos', url: '/a-propos' },
  { name: 'scores, historique vide', url: '/scores' },
  { name: 'scores, 30 parties', url: '/scores', history: MANY_PARTIES },
  { name: 'réglages', url: '/reglages' },
  ...GAMES.flatMap(gameScreens),
]

test.describe('aucun défilement vertical', () => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 393, height: 852 },
  ]) {
    test.describe(`${size.width} x ${size.height}`, () => {
      test.use({ viewport: size })
      for (const screen of SCREENS) {
        test(screen.name, async ({ page }) => {
          await page.addInitScript(
            ({ mode, party, game, history, newsSeen }) => {
              window.localStorage.clear()
              window.localStorage.setItem('masterscards:welcomed', '1')
              // Nouveautés déjà vues : pas de popup par-dessus l'écran testé.
              window.localStorage.setItem('masterscards:news-seen', newsSeen)
              if (mode) window.localStorage.setItem('masterscards:mode', mode)
              if (party) window.localStorage.setItem(`masterscards:session:${game}`, JSON.stringify(party))
              if (history) window.localStorage.setItem('masterscards:history', JSON.stringify(history))
            },
            {
              mode: screen.mode,
              party: screen.party,
              game: screen.game,
              history: screen.history,
              newsSeen: NEWS_SEEN,
            },
          )
          await page.goto(screen.url)
          await ready(page)
          const overflow = await page.evaluate(
            () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
          )
          expect(overflow, `dépasse de ${overflow}px`).toBeLessThanOrEqual(0)
        })
      }
    })
  }
})
