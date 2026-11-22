import { expect, test } from '@playwright/test'
import { deckPlan } from '../src/data/deck.ts'
import { GAMES, namesOf, fill, winTarget } from './games.ts'

// Le même parcours pour chaque jeu de src/content/games/ : un jeu ajouté par sa seule configuration y passe
// sans qu'on touche à ce fichier. Sur le build de production (service worker inclus).
test.describe('parcours de chaque jeu', () => {
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

  for (const game of GAMES) {
    test(`${game.name} : de l’accueil au podium, puis l’historique`, async ({ page }) => {
      const groups = game.card_groups
      const word = game.group_word ?? 'Groupe'
      const names = namesOf(game.players.min)

      // Accueil → le jeu.
      await page.goto('/')
      await page.getByRole('link', { name: new RegExp(game.name) }).click()
      await expect(page.getByRole('heading', { level: 1, name: game.name })).toBeVisible()
      await expect(page.getByText(game.tagline)).toBeVisible()
      await page.getByRole('link', { name: 'Jouer' }).click()

      // Tes cartes : le bandeau annonce le nombre de cartes calculé, une ligne par groupe.
      await expect(page.getByRole('heading', { level: 1, name: 'Tes cartes' })).toBeVisible()
      // Rien à retirer (6 qui prend) : « Garde tout le paquet… », sans nombre.
      const plan = deckPlan(game)
      await expect(
        page.getByText(plan.removedTotal === 0 ? /Garde tout le paquet/ : new RegExp(`${plan.keptTotal} cartes`)),
      ).toBeVisible()
      for (const group of groups) await expect(page.getByText(group.short).first()).toBeVisible()

      // La vue à balayer, groupe par groupe, jusqu'au dernier.
      await page
        .getByRole('link', { name: new RegExp(groups[0].label) })
        .first()
        .click()
      for (const [i, group] of groups.entries()) {
        await expect(page.getByText(`${word} ${i + 1} / ${groups.length}`)).toBeVisible()
        await expect(page.getByText(group.detail.text)).toBeVisible()
        const last = i === groups.length - 1
        await page.getByRole('button', { name: last ? 'Terminer' : 'Suivant', exact: true }).click()
      }
      await expect(page.getByRole('heading', { level: 1, name: 'Tes cartes' })).toBeVisible()

      // Mise en place, un tour, puis Qui joue ?
      await page.getByRole('link', { name: 'Suivant' }).click()
      await expect(page.getByRole('heading', { level: 1, name: game.tutorial.setup.title })).toBeVisible()
      await expect(page.getByText(game.tutorial.setup.steps[0])).toBeVisible()
      await page.getByRole('link', { name: 'Suivant' }).click()
      await expect(page.getByRole('heading', { level: 1, name: game.tutorial.turn.title })).toBeVisible()
      // « Compter les points », facultatif, vient avant « Qui joue ? ».
      if (game.points) {
        await page.getByRole('link', { name: 'Suivant' }).click()
        await expect(page.getByRole('heading', { level: 1, name: 'Compter les points' })).toBeVisible()
        for (const row of game.points.rows) await expect(page.getByText(row.label, { exact: true })).toBeVisible()
      }
      await page.getByRole('link', { name: 'Jouer' }).click()

      for (const [i, name] of names.entries())
        await page.getByRole('textbox', { name: `Prénom du joueur ${i + 1}` }).fill(name)
      await page.getByRole('button', { name: 'C’est parti' }).click()
      await expect(page.getByRole('heading', { level: 1, name: 'Partie en cours' })).toBeVisible()
      await expect(page.getByText(fill(game.scoring.party_label, { round: 1 }))).toBeVisible()

      // Une première manche à un point, puis le reste jusqu'au score visé.
      const { unit, title, validate } = game.scoring
      await page.getByRole('link', { name: 'Noter les scores' }).click()
      await expect(page.getByRole('heading', { level: 1, name: fill(title, { round: 1 }) })).toBeVisible()
      await page.getByRole('button', { name: `Un ${unit} de plus pour ${names[0]}` }).click()
      await page.getByRole('button', { name: validate }).click()
      await expect(page.getByRole('img', { name: `${names[0]} : 1` })).toBeVisible()
      await expect(page.getByText(fill(game.scoring.party_label, { round: 2 }))).toBeVisible()

      const target = winTarget(game.scoring, names.length)
      if (target === undefined) {
        await page.getByRole('button', { name: 'Terminer la partie' }).click()
        await expect(page.getByText('Partie interrompue')).toBeVisible()
      } else {
        await page.getByRole('link', { name: 'Noter les scores' }).click()
        for (let i = 1; i < target; i++)
          await page.getByRole('button', { name: `Un ${unit} de plus pour ${names[0]}` }).click()
        await page.getByRole('button', { name: validate }).click()
        await expect(page.getByText('Partie terminée')).toBeVisible()
        await expect(page.getByRole('list', { name: 'Podium des joueurs' })).toContainText(names[0])
      }

      // L'historique garde la partie, sous le nom du jeu.
      await page.getByRole('link', { name: 'Voir l’historique' }).click()
      await expect(page.getByRole('heading', { level: 1, name: 'Tes scores' })).toBeVisible()
      await expect(page.getByRole('button', { name: new RegExp(`${game.name}.*1 partie`) })).toBeVisible()

      // Même chemin à chaque fois : « Jouer » rouvre « Tes cartes », même après un tutoriel fini.
      await page.goto(`/jeu/${game.id}`)
      await expect(page.getByRole('link', { name: 'Jouer' })).toHaveAttribute('href', `/jeu/${game.id}/tutoriel/cartes`)
    })
  }

  for (const game of GAMES) {
    test(`${game.name} : « Passer cette étape » démarre sans jetons, les prénoms se demandent pour noter les scores`, async ({
      page,
    }) => {
      await page.goto(`/jeu/${game.id}/joueurs`)
      await page.getByRole('button', { name: 'Passer cette étape' }).click()
      await expect(page.getByRole('heading', { level: 1, name: 'Partie en cours' })).toBeVisible()
      // Pas de jetons sans prénoms.
      await expect(page.getByRole('img', { name: /: 0$/ })).toHaveCount(0)

      // « Noter les scores » propose de remplir les joueurs ; le nombre de joueurs est gardé.
      await page.getByRole('link', { name: 'Noter les scores' }).click()
      await expect(page.getByText('Pour noter les scores, écris le prénom de chaque joueur.')).toBeVisible()
      await expect(page.getByRole('textbox')).toHaveCount(game.players.min)
      await page.getByRole('textbox', { name: 'Prénom du joueur 1' }).fill('Léa')
      await page.getByRole('button', { name: 'C’est parti' }).click()
      await expect(page.getByRole('heading', { level: 1, name: fill(game.scoring.title, { round: 1 }) })).toBeVisible()

      // Les jetons apparaissent une fois les prénoms donnés.
      await page.getByRole('link', { name: /Retour/ }).click()
      await expect(page.getByRole('img', { name: 'Léa : 0' })).toBeVisible()
    })
  }
})
