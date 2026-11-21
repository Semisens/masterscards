import { expect, test, type Page } from '@playwright/test'

/** Balayage tactile simulé sur la zone qui porte le geste (celle qui a `tabindex="-1"`). */
async function swipe(page: Page, from: number, to: number) {
  await page
    .locator('[tabindex="-1"]')
    .first()
    .evaluate(
      (el, [a, b]) => {
        const fire = (type: string, x: number) =>
          el.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', clientX: x, clientY: 300, bubbles: true }))
        fire('pointerdown', a)
        fire('pointerup', b)
      },
      [from, to],
    )
}

// Parcours complets sur le build de production (service worker inclus).
test.describe('parcours Trio', () => {
  test('du choix du jeu à une partie avec un score', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'C’est compris' }).click()
    // Pas de choix de mode à l'accueil : il se fait dans « Tes cartes ».
    // Les pastilles de filtre sont des radios : le mode de lecture, lui, ne se choisit pas ici.
    await expect(page.getByRole('radio', { name: 'Classique' })).toHaveCount(0)
    await expect(page.getByRole('radio', { name: 'Connaisseur' })).toHaveCount(0)
    await page.getByRole('link', { name: /Trio/ }).click()

    await expect(page).toHaveURL(/\/jeu\/trio$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Trio' })).toBeVisible()
    await page.getByRole('link', { name: 'Jouer' }).click()

    // Tes cartes : la bascule de mode, le bandeau, la liste groupée.
    await expect(page.getByRole('heading', { level: 1, name: 'Tes cartes' })).toBeVisible()
    await expect(page.getByText('Retire les carreaux et les rois. Garde 36 cartes.')).toBeVisible()
    await page.getByRole('radio', { name: 'Connaisseur' }).check()
    await expect(page.getByText('2–6', { exact: true })).toBeVisible()
    await page.getByRole('radio', { name: 'Classique' }).check()

    // Un clic sur une ligne ouvre la vue à balayer.
    await page.getByRole('link', { name: /7.*Spécial/ }).click()
    await expect(page).toHaveURL(/\/cartes\/3$/)
    await expect(page.getByText('Groupe 3 / 6')).toBeVisible()
    await expect(page.getByText(/Le 7 est spécial/)).toBeVisible()
    await page.getByRole('button', { name: 'Suivant', exact: true }).click()
    await expect(page.getByText('Groupe 4 / 6')).toBeVisible()
    await page.getByRole('link', { name: /Retour/ }).click()
    await expect(page).toHaveURL(/\/tutoriel\/cartes$/)

    await page.getByRole('link', { name: /Suivant/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Mise en place' })).toBeVisible()
    await page.getByRole('link', { name: 'Suivant' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Un tour de jeu' })).toBeVisible()
    await page.getByRole('link', { name: 'Jouer' }).click()

    // Qui joue ? puis la partie.
    await page.getByRole('textbox', { name: 'Prénom du joueur 1' }).fill('Léa')
    await page.getByRole('textbox', { name: 'Prénom du joueur 2' }).fill('Tom')
    await page.getByRole('button', { name: 'C’est parti' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Partie en cours' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Léa : 0' })).toBeVisible()

    await page.getByRole('link', { name: 'Noter les scores' }).click()
    await page.getByRole('button', { name: 'Un trio de plus pour Léa' }).click()
    await page.getByRole('button', { name: 'Un trio de plus pour Léa' }).click()
    await page.getByRole('button', { name: 'Valider' }).click()
    await expect(page.getByRole('img', { name: 'Léa : 2' })).toBeVisible()
  })

  test('la partie est mémorisée après un rechargement, puis se termine', async ({ page }) => {
    await page.addInitScript(() => {
      if (!window.localStorage.getItem('masterscards:session:trio'))
        window.localStorage.setItem(
          'masterscards:session:trio',
          JSON.stringify({
            players: [
              { name: 'Léa', score: 2 },
              { name: 'Tom', score: 1 },
              { name: 'Inès', score: 0 },
            ],
          }),
        )
    })
    await page.goto('/jeu/trio/partie')
    await expect(page.getByRole('img', { name: 'Léa : 2' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('img', { name: 'Léa : 2' })).toBeVisible()

    await page.getByRole('button', { name: 'Terminer la partie' }).click()
    await expect(page).toHaveURL(/\/jeu\/trio\/resultat\/\d+$/)
    await expect(page.getByText('Partie interrompue')).toBeVisible()
    expect(await page.evaluate(() => window.localStorage.getItem('masterscards:session:trio'))).toBeNull()
    expect(await page.evaluate(() => window.localStorage.getItem('masterscards:history'))).toContain('"interrupted"')
  })

  test('les raccourcis de la partie y ramènent', async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem(
        'masterscards:session:trio',
        JSON.stringify({
          players: [
            { name: 'Léa', score: 0 },
            { name: 'Tom', score: 0 },
            { name: 'Inès', score: 0 },
          ],
        }),
      ),
    )
    await page.goto('/jeu/trio/partie')
    await page.getByRole('link', { name: 'Cartes' }).click()
    await expect(page).toHaveURL(/depuis=partie/)
    await expect(page.getByRole('link', { name: 'Quitter le tutoriel' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Retour à la partie' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Partie en cours' })).toBeVisible()
  })

  test('les règles complètes se lisent depuis la page du jeu', async ({ page }) => {
    await page.goto('/jeu/trio')
    await page.getByRole('link', { name: 'Règles complètes' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Règles complètes' })).toBeVisible()
    await expect(page.getByText('Mode piquant')).toBeVisible()
  })

  test('le mode choisi est mémorisé après un rechargement', async ({ page }) => {
    await page.goto('/jeu/trio/tutoriel/cartes')
    // Le radio, transparent, recouvre son libellé : c'est lui que touche le doigt.
    await page.getByRole('radio', { name: 'Connaisseur' }).check()
    await page.reload()
    await expect(page.getByRole('radio', { name: 'Connaisseur' })).toBeChecked()
  })

  test('le mot de bienvenue ne revient pas une fois fermé', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'C’est compris' }).click()
    await page.reload()
    await expect(page.getByRole('link', { name: /Trio/ })).toBeVisible()
    await expect(page.getByText('Bienvenue !')).toHaveCount(0)
  })
})

test.describe('navigation', () => {
  test('les groupes de cartes se parcourent au balayage tactile', async ({ page }) => {
    await page.goto('/jeu/trio/tutoriel/cartes/3')
    await swipe(page, 300, 100)
    await expect(page.getByText('Groupe 4 / 6')).toBeVisible()
    await swipe(page, 100, 300)
    await expect(page.getByText('Groupe 3 / 6')).toBeVisible()
  })

  test('les groupes de cartes se parcourent aux flèches du clavier', async ({ page }) => {
    await page.goto('/jeu/trio/tutoriel/cartes/3')
    await page.getByRole('button', { name: 'Groupe suivant' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByText('Groupe 4 / 6')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByText('Groupe 3 / 6')).toBeVisible()
  })

  test('un groupe inexistant est signalé', async ({ page }) => {
    await page.goto('/jeu/trio/tutoriel/cartes/9')
    await expect(page.getByText('Ce groupe de cartes n’existe pas.')).toBeVisible()
  })
})

test.describe('erreurs', () => {
  test('un jeu inconnu affiche un message et un retour à l’accueil', async ({ page }) => {
    await page.goto('/jeu/nexiste-pas')
    await expect(page.getByText('Ce jeu n’existe pas ou n’est plus disponible.')).toBeVisible()
    await page.getByRole('link', { name: 'Retour à l’accueil' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('hors ligne', () => {
  test('Trio se lit et se joue sans réseau', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.reload()
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

    await context.setOffline(true)

    // Navigation dans l'app, puis adresses profondes chargées directement, toujours sans réseau.
    await page.getByRole('link', { name: /Trio/ }).click()
    await page.getByRole('link', { name: 'Jouer' }).click()
    await expect(page.getByText('Retire les carreaux et les rois. Garde 36 cartes.')).toBeVisible()
    await page.goto('/jeu/trio/tutoriel/cartes/6')
    await expect(page.getByText('Groupe 6 / 6')).toBeVisible()
    await page.goto('/jeu/trio/regles')
    await expect(page.getByRole('heading', { level: 1, name: 'Règles complètes' })).toBeVisible()

    // Une partie se crée et se note sans réseau.
    await page.goto('/jeu/trio/joueurs')
    await page.getByRole('textbox', { name: 'Prénom du joueur 1' }).fill('Léa')
    await page.getByRole('button', { name: 'C’est parti' }).click()
    await expect(page.getByRole('img', { name: 'Léa : 0' })).toBeVisible()

    // Les polices embarquées sont servies depuis le cache : rien ne doit retomber sur une police système.
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready
      return [document.fonts.check('700 16px Fredoka'), document.fonts.check('700 16px Nunito')]
    })
    expect(fonts).toEqual([true, true])
  })
})

test.describe('parcours Love Letter', () => {
  test.beforeEach(async ({ page }) => {
    // Une seule fois par test : sans cette garde, chaque navigation effacerait ce que l'app a mémorisé.
    await page.addInitScript(() => {
      if (window.sessionStorage.getItem('test-init')) return
      window.sessionStorage.setItem('test-init', '1')
      window.localStorage.clear()
      window.localStorage.setItem('masterscards:welcomed', '1')
      // Nouveautés déjà vues : pas de popup par-dessus l'écran testé.
      window.localStorage.setItem('masterscards:news-seen', '9999.0.0')
    })
  })

  test('du choix du jeu au podium, en manches, puis l’historique et les réglages', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Love Letter/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Love Letter' })).toBeVisible()
    await page.getByRole('link', { name: 'Jouer' }).click()

    // Tes cartes : 21 cartes dont 2 jokers, 10 groupes, le mode connaisseur donne les noms d'origine.
    await expect(page.getByText('Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet.')).toBeVisible()
    await page.getByRole('radio', { name: 'Connaisseur' }).check()
    await expect(page.getByText('Prêtre')).toBeVisible()
    await page.getByRole('radio', { name: 'Classique' }).check()
    await page.getByRole('link', { name: /Valets et rois noirs/ }).click()
    await expect(page.getByText('Carte 2 / 10')).toBeVisible()
    await page.getByRole('link', { name: /Retour/ }).click()

    // Le tutoriel jusqu'au bout.
    await page.getByRole('link', { name: 'Suivant' }).click()
    await expect(page.getByText('Écartée, cachée')).toBeVisible()
    await page.getByRole('link', { name: 'Suivant' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Un tour de jeu' })).toBeVisible()
    await page.getByRole('link', { name: 'Jouer' }).click()

    // Deux joueurs : le score visé est 6. On joue deux manches.
    await page.getByRole('textbox', { name: 'Prénom du joueur 1' }).fill('Léa')
    await page.getByRole('textbox', { name: 'Prénom du joueur 2' }).fill('Tom')
    await page.getByRole('button', { name: 'C’est parti' }).click()
    await expect(page.getByText('Manche 1')).toBeVisible()
    await page.getByRole('link', { name: 'Noter les scores' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Fin de la manche 1' })).toBeVisible()
    await page.getByRole('button', { name: 'Un point de plus pour Léa' }).click()
    await page.getByRole('button', { name: 'Valider la manche' }).click()
    await expect(page.getByText('Manche 2')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Léa : 1' })).toBeVisible()

    // Une partie interrompue arrive dans l'historique.
    await page.getByRole('button', { name: 'Terminer la partie' }).click()
    await expect(page.getByText('Partie interrompue')).toBeVisible()
    await page.getByRole('link', { name: 'Voir l’historique' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Tes scores' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Love Letter.*1 partie/ })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Interrompue')).toBeVisible()
  })

  test('la partie se termine d’elle-même au score visé : 6 points à deux joueurs', async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem(
        'masterscards:session:love-letter',
        JSON.stringify({
          players: [
            { name: 'Léa', score: 5 },
            { name: 'Tom', score: 3 },
          ],
          round: 9,
        }),
      ),
    )
    await page.goto('/jeu/love-letter/partie/scores')
    await page.getByRole('button', { name: 'Un point de plus pour Léa' }).click()
    await page.getByRole('button', { name: 'Valider la manche' }).click()
    await expect(page.getByText('Partie terminée')).toBeVisible()
    await expect(page.getByRole('list', { name: 'Podium des joueurs' })).toContainText('Léa')
  })

  test('à six joueurs, la partie se termine à 3 points', async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem(
        'masterscards:session:love-letter',
        JSON.stringify({
          players: ['Léa', 'Tom', 'Zoé', 'Max', 'Ana', 'Lou'].map((name, i) => ({ name, score: i === 0 ? 2 : 1 })),
          round: 5,
        }),
      ),
    )
    await page.goto('/jeu/love-letter/partie/scores')
    await page.getByRole('button', { name: 'Un point de plus pour Léa' }).click()
    await page.getByRole('button', { name: 'Valider la manche' }).click()
    await expect(page.getByText('Partie terminée')).toBeVisible()
  })

  test('la recherche et les filtres de l’accueil', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('searchbox', { name: 'Recherche' }).fill('trio')
    await expect(page.getByRole('link', { name: /Love Letter/ })).toHaveCount(0)
    await page.getByRole('searchbox', { name: 'Recherche' }).fill('')
    await page.getByRole('radio', { name: 'Rapide' }).check()
    await expect(page.getByRole('link', { name: /Love Letter/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Trio/ })).toBeVisible()
  })

  test('Love Letter se lit sans réseau', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.reload()
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
    await context.setOffline(true)
    await page.goto('/jeu/love-letter/tutoriel/cartes')
    await expect(page.getByText('Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet.')).toBeVisible()
    await page.goto('/scores')
    await expect(page.getByRole('heading', { level: 1, name: 'Tes scores' })).toBeVisible()
    // La calligraphie du nom (Great Vibes) est servie depuis le cache, elle aussi.
    await page.goto('/jeu/love-letter')
    await expect(page.getByRole('heading', { level: 1, name: 'Love Letter' })).toBeVisible()
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready
      return document.fonts.check('400 64px "Great Vibes"')
    })
    expect(fonts).toBe(true)
  })
})
