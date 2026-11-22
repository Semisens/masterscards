import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { games } from './data/games.ts'
import { renderApp } from './test/renderApp.tsx'

const LL_KEY = 'masterscards:session:love-letter'
const store = (key: string, value: unknown) => window.localStorage.setItem(key, JSON.stringify(value))
const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? 'null')

const LL_PARTY = {
  players: [
    { name: 'Léa', score: 2 },
    { name: 'Tom', score: 1 },
    { name: 'Inès', score: 0 },
  ],
  round: 3,
}

const ENTRY = (id: string, partial: object = {}) => ({
  id,
  gameId: 'love-letter',
  date: '2026-10-12T18:00:00.000Z',
  status: 'finished',
  players: [
    { name: 'Léa', score: 4 },
    { name: 'Tom', score: 2 },
  ],
  ...partial,
})

beforeEach(() => window.localStorage.clear())

describe('accueil « Tes jeux »', () => {
  it('liste Love Letter et Trio, avec joueurs et durée', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Tes jeux' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Love Letter/ })).toHaveTextContent('2–6 joueurs · 20 min')
    expect(screen.getByRole('link', { name: /Trio/ })).toHaveTextContent('3–6 joueurs · 15 min')
  })

  it('cherche dans le nom, sans casse', async () => {
    renderApp('/')
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Recherche' }), 'LOVE')
    expect(screen.getByRole('link', { name: /Love Letter/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Trio/ })).not.toBeInTheDocument()
  })

  it('filtre : « 2–4 joueurs » puis « Rapide »', async () => {
    renderApp('/')
    await userEvent.click(await screen.findByRole('radio', { name: '2–4 joueurs' }))
    expect(screen.getByRole('link', { name: /Love Letter/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Trio/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Rapide' }))
    expect(screen.getByRole('link', { name: /Trio/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Love Letter/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Tous' }))
    expect(screen.getAllByRole('link', { name: /joueurs/ })).toHaveLength(games.length)
  })

  it('dit quand rien ne correspond', async () => {
    renderApp('/')
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Recherche' }), 'zzz')
    expect(screen.getByText('Aucun jeu trouvé')).toBeInTheDocument()
  })

  it('a la barre d’onglets, sur Jeux', async () => {
    renderApp('/')
    expect(await screen.findByRole('link', { name: 'Jeux' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Scores' })).toHaveAttribute('href', '/scores')
    expect(screen.getByRole('link', { name: 'Réglages' })).toHaveAttribute('href', '/reglages')
  })
})

describe('Love Letter : tutoriel', () => {
  const KEEP = 'Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet.'

  it('annonce 21 cartes à garder, dont 2 jokers, sans liste à retirer', async () => {
    renderApp('/jeu/love-letter/tutoriel/cartes')
    expect(await screen.findByText(KEEP)).toBeInTheDocument()
  })

  it('liste 10 groupes ; le mode connaisseur donne le nom du personnage', async () => {
    renderApp('/jeu/love-letter/tutoriel/cartes')
    const rows = () =>
      screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.includes('/tutoriel/cartes/'))
    await screen.findByText(KEEP)
    expect(rows()).toHaveLength(10)
    expect(rows()[0]).toHaveTextContent('Jokers')
    expect(rows()[0]).toHaveTextContent('2 cartes')
    expect(rows()[0]).toHaveTextContent('Peut remporter 1 point.')
    expect(rows()[1]).toHaveTextContent('Valets et rois noirs')
    expect(rows()[1]).toHaveTextContent('6 cartes')
    expect(rows()[1]).toHaveTextContent('Devine la carte d’un rival.')
    expect(rows()[9]).toHaveTextContent('Dame de cœur')
    await userEvent.click(screen.getByRole('radio', { name: 'Connaisseur' }))
    expect(rows()[0]).toHaveTextContent('Espionne')
    expect(rows()[1]).toHaveTextContent('Garde')
    expect(rows()[2]).toHaveTextContent('Prêtre')
    expect(rows()[9]).toHaveTextContent('Princesse')
  })

  it('dessine le joker : une étoile, sans lettre de rang', async () => {
    renderApp('/jeu/love-letter/tutoriel/cartes')
    await screen.findByText(KEEP)
    const first = screen.getAllByRole('link').find((link) => link.getAttribute('href')?.endsWith('/tutoriel/cartes/1'))!
    expect(first.querySelector('svg')).not.toBeNull()
    expect(first.textContent).not.toMatch(/\bJ\b/)
  })

  it('numérote la vue à balayer « Carte 3 / 10 » et explique le pouvoir en mode connaisseur', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/love-letter/tutoriel/cartes/3')
    expect(await screen.findByText('Carte 3 / 10')).toBeInTheDocument()
    expect(screen.getByText('Choisis un rival. Il te montre sa carte. Ne la répète à personne.')).toBeInTheDocument()
    expect(
      screen.getByText('Mode connaisseur : Prêtre. Pouvoir d’origine : voir la main d’un joueur.'),
    ).toBeInTheDocument()
  })

  it('dessine les cartes d’origine en mode connaisseur seulement', async () => {
    renderApp('/jeu/love-letter/tutoriel/cartes/3')
    await screen.findByText('Carte 3 / 10')
    expect(screen.queryByRole('list', { name: 'Dans le jeu d’origine' })).not.toBeInTheDocument()
  })

  it('montre la carte d’origine et son nom sur la vue à balayer, en mode connaisseur', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/love-letter/tutoriel/cartes/3')
    const list = await screen.findByRole('list', { name: 'Dans le jeu d’origine' })
    expect(list).toHaveTextContent('2')
    expect(list).toHaveTextContent('Prêtre')
  })

  it('Trio : une image par carte d’origine en mode connaisseur, cinq pour « 2 à 6 »', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/trio/tutoriel/cartes/2')
    const list = await screen.findByRole('list', { name: 'Dans le jeu d’origine' })
    expect(list.querySelectorAll('img')).toHaveLength(5)
  })

  it('Trio : la liste montre une main de trois cartes pour un groupe en image', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/trio/tutoriel/cartes')
    await screen.findByText('Retire les carreaux et les rois. Garde 36 cartes.')
    const rows = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.includes('/tutoriel/cartes/'))
    expect(rows[0].querySelectorAll('img')).toHaveLength(1)
    expect(rows[1].querySelectorAll('img')).toHaveLength(3)
  })

  it('montre le joker sur la vue à balayer du premier groupe', async () => {
    renderApp('/jeu/love-letter/tutoriel/cartes/1')
    expect(await screen.findByText('Carte 1 / 10')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Jokers' })).toBeInTheDocument()
  })

  it('dit de garder tout le paquet et les jokers quand rien n’est à retirer (6 qui prend)', async () => {
    renderApp('/jeu/6-qui-prend/tutoriel/cartes')
    expect(await screen.findByText('Garde tout le paquet, avec les 2 jokers. Ne retire rien.')).toBeInTheDocument()
  })

  it('compte les points de 6 qui prend : une ligne par valeur, puis « Jouer »', async () => {
    renderApp('/jeu/6-qui-prend/tutoriel/points')
    expect(await screen.findByRole('heading', { level: 1, name: 'Compter les points' })).toBeInTheDocument()
    const rows = within(screen.getByRole('list', { name: 'Points de chaque carte' })).getAllByRole('listitem')
    expect(rows).toHaveLength(5)
    expect(rows[0]).toHaveTextContent('Dame de pique')
    expect(rows[0]).toHaveTextContent('7 points')
    expect(rows[4]).toHaveTextContent('1 point')
    expect(screen.getByRole('link', { name: 'Jouer' })).toHaveAttribute('href', '/jeu/6-qui-prend/joueurs')
  })

  it('donne la valeur d’origine en mode connaisseur (6 qui prend)', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/6-qui-prend/tutoriel/points')
    expect(await screen.findByText('7 têtes')).toBeInTheDocument()
  })

  it('ramène à la saisie des scores quand on y a ouvert « Compter les points »', async () => {
    renderApp('/jeu/6-qui-prend/tutoriel/points?depuis=scores')
    expect(await screen.findByRole('link', { name: 'Retour aux scores' })).toHaveAttribute(
      'href',
      '/jeu/6-qui-prend/partie/scores',
    )
    expect(screen.queryByText('Quitter le tutoriel')).not.toBeInTheDocument()
  })

  it('n’a pas d’écran « Compter les points » pour un jeu qui n’en déclare pas (Trio)', async () => {
    renderApp('/jeu/trio/tutoriel/points')
    expect(await screen.findByText('Cette page n’existe pas.')).toBeInTheDocument()
  })

  it('remplace la carte en pointillés par la carte d’origine en mode connaisseur', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/love-letter/tutoriel/cartes')
    await screen.findByText('Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet.')
    const rows = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.includes('/tutoriel/cartes/'))
    expect(rows[2]).toHaveTextContent('Prêtre')
    expect(rows[2].textContent).toMatch(/^2/)
  })

  it('montre « Un tour » sur la table de la mise en place : ta main de face, des cartes jouées devant les autres', async () => {
    renderApp('/jeu/love-letter/tutoriel/tour')
    expect(await screen.findByText('Ta main')).toBeInTheDocument()
    expect(screen.getByText('Pioche')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '5 de cœur', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dame de cœur', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 de pique' })).toBeInTheDocument()
  })

  it('dessine les deux éléments de la mise en place, sans cartes visibles à 2 joueurs', async () => {
    renderApp('/jeu/love-letter/tutoriel/mise-en-place')
    expect(await screen.findByText('Pioche')).toBeInTheDocument()
    expect(screen.getByText('Écartée, cachée')).toBeInTheDocument()
    expect(screen.queryByText('Visibles (2 joueurs)')).not.toBeInTheDocument()
    expect(screen.getByText('Mélange les 21 cartes.')).toBeInTheDocument()
  })
})

describe('Love Letter : partie en manches', () => {
  it('affiche la manche en cours', async () => {
    store(LL_KEY, LL_PARTY)
    renderApp('/jeu/love-letter/partie')
    expect(await screen.findByText('Manche 3')).toBeInTheDocument()
  })

  it('saisit les points de la manche, de zéro : valider les ajoute et passe à la manche suivante', async () => {
    store(LL_KEY, LL_PARTY)
    const app = renderApp('/jeu/love-letter/partie/scores')
    expect(await screen.findByRole('heading', { level: 1, name: 'Fin de la manche 3' })).toBeInTheDocument()
    expect(screen.getByText('Qui a gagné des points ?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Un point de plus pour Inès' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider la manche' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/love-letter/partie'))
    expect(stored(LL_KEY)).toEqual({
      players: [
        { name: 'Léa', score: 2 },
        { name: 'Tom', score: 1 },
        { name: 'Inès', score: 1 },
      ],
      round: 4,
    })
  })

  it('termine la partie quand un joueur atteint le score visé (5 à trois joueurs) : podium et historique', async () => {
    store(LL_KEY, { ...LL_PARTY, players: [{ name: 'Léa', score: 4 }, ...LL_PARTY.players.slice(1)] })
    const app = renderApp('/jeu/love-letter/partie/scores')
    await userEvent.click(await screen.findByRole('button', { name: 'Un point de plus pour Léa' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider la manche' }))
    await waitFor(() => expect(app.location()).toMatch(/^\/jeu\/love-letter\/resultat\/\d+$/))
    expect(await screen.findByText('Partie terminée')).toBeInTheDocument()
    expect(stored(LL_KEY)).toBeNull()
    expect(stored('masterscards:history')).toHaveLength(1)
    expect(stored('masterscards:history')[0]).toMatchObject({ gameId: 'love-letter', status: 'finished' })
  })

  it('ne termine pas la partie tant que personne n’a le score visé', async () => {
    store(LL_KEY, LL_PARTY)
    const app = renderApp('/jeu/love-letter/partie/scores')
    await userEvent.click(await screen.findByRole('button', { name: 'Un point de plus pour Léa' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider la manche' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/love-letter/partie'))
    expect(stored('masterscards:history')).toBeNull()
  })
})

describe('Loup-garou : de 6 à 12 joueurs', () => {
  const LG_KEY = 'masterscards:session:loup-garou'
  const NAMES = ['Léa', 'Tom', 'Inès', 'Sam', 'Maé', 'Noé', 'Lou', 'Max', 'Zoé', 'Eli', 'Ana', 'Jo']
  const TWELVE = { players: NAMES.map((name) => ({ name, score: 0 })), round: 1 }

  it('garde une réserve de 16 cartes, un rôle par ligne', async () => {
    renderApp('/jeu/loup-garou/tutoriel/cartes')
    expect(await screen.findByText(/Garde (ces )?16 cartes/)).toBeInTheDocument()
    expect(screen.getByText('Les loups-garous.')).toBeInTheDocument()
    expect(screen.getByText('Les villageois.')).toBeInTheDocument()
  })

  it('numérote la vue à balayer « Rôle 1 / 7 »', async () => {
    renderApp('/jeu/loup-garou/tutoriel/cartes/1')
    expect(await screen.findByText('Rôle 1 / 7')).toBeInTheDocument()
  })

  it('« Qui joue ? » part de 6 prénoms et monte jusqu’à 12, pas plus', async () => {
    renderApp('/jeu/loup-garou/joueurs')
    expect(await screen.findAllByRole('textbox')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Un joueur de moins' })).toBeDisabled()
    for (let i = 0; i < 6; i++) await userEvent.click(screen.getByRole('button', { name: 'Un joueur de plus' }))
    expect(screen.getAllByRole('textbox')).toHaveLength(12)
    expect(screen.getByRole('button', { name: 'Un joueur de plus' })).toBeDisabled()
  })

  it('montre les 12 jetons et un compteur par joueur à 12 joueurs', async () => {
    store(LG_KEY, TWELVE)
    renderApp('/jeu/loup-garou/partie')
    expect(await screen.findByRole('img', { name: 'Jo : 0' })).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Joueurs de la partie' })).getAllByRole('img')).toHaveLength(12)
  })

  it('note les points du camp gagnant, joueur par joueur, à 12 joueurs', async () => {
    store(LG_KEY, TWELVE)
    const app = renderApp('/jeu/loup-garou/partie/scores')
    expect(await screen.findByText('Qui était dans le camp gagnant ?')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Un point de plus pour / })).toHaveLength(12)
    await userEvent.click(screen.getByRole('button', { name: 'Un point de plus pour Jo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider la manche' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/loup-garou/partie'))
    expect(stored(LG_KEY).players[11]).toEqual({ name: 'Jo', score: 1 })
  })
})

describe('podium', () => {
  it('place le premier au centre, le deuxième à gauche, le troisième à droite, puis la liste', async () => {
    store('masterscards:history', [
      ENTRY('1', {
        players: [
          { name: 'Tom', score: 2 },
          { name: 'Léa', score: 3 },
          { name: 'Inès', score: 1 },
          { name: 'Sam', score: 0 },
        ],
      }),
    ])
    renderApp('/jeu/love-letter/resultat/1')
    expect(await screen.findByText('Partie terminée')).toBeInTheDocument()
    const podium = screen.getByRole('list', { name: 'Podium des joueurs' })
    const names = Array.from(podium.querySelectorAll('li')).map((li) => li.getAttribute('aria-label'))
    expect(names).toEqual(['2e : Tom, 2', '1er : Léa, 3', '3e : Inès, 1'])
    expect(screen.getByText('4e')).toBeInTheDocument()
    expect(screen.getByText('Sam')).toBeInTheDocument()
  })

  it('dit « Partie interrompue » quand la partie a été arrêtée', async () => {
    store('masterscards:history', [ENTRY('1', { status: 'interrupted' })])
    renderApp('/jeu/love-letter/resultat/1')
    expect(await screen.findByText('Partie interrompue')).toBeInTheDocument()
  })

  it('mène à l’historique et à l’accueil', async () => {
    store('masterscards:history', [ENTRY('1')])
    renderApp('/jeu/love-letter/resultat/1')
    expect(await screen.findByRole('link', { name: 'Voir l’historique' })).toHaveAttribute('href', '/scores')
    expect(screen.getByRole('link', { name: 'Retour aux jeux' })).toHaveAttribute('href', '/')
  })

  it('explique quand la partie est introuvable', async () => {
    renderApp('/jeu/love-letter/resultat/42')
    expect(await screen.findByText('Cette partie est introuvable.')).toBeInTheDocument()
  })
})

describe('historique « Tes scores »', () => {
  it('invite à jouer quand il est vide', async () => {
    renderApp('/scores')
    expect(await screen.findByText('Aucune partie pour le moment')).toBeInTheDocument()
  })

  it('ouvre le jeu le plus récent : date, deux meilleurs, état', async () => {
    store('masterscards:history', [
      ENTRY('2', { date: '2026-10-12T10:00:00.000Z' }),
      ENTRY('1', { date: '2026-10-03T10:00:00.000Z', status: 'interrupted' }),
      ENTRY('3', { gameId: 'trio', date: '2026-09-28T10:00:00.000Z' }),
    ])
    renderApp('/scores')
    expect(await screen.findByRole('button', { name: /Love Letter.*2 parties/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('12 oct.')).toBeInTheDocument()
    expect(screen.getAllByText('Léa 4 · Tom 2')).toHaveLength(2)
    expect(screen.getByText('Terminée')).toBeInTheDocument()
    expect(screen.getByText('Interrompue')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trio.*1 partie/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Scores' })).toHaveAttribute('aria-current', 'page')
  })

  it('ouvre un autre jeu au toucher, et referme le premier', async () => {
    store('masterscards:history', [ENTRY('2'), ENTRY('3', { gameId: 'trio', date: '2026-09-28T10:00:00.000Z' })])
    renderApp('/scores')
    await userEvent.click(await screen.findByRole('button', { name: /Trio/ }))
    expect(screen.getByRole('button', { name: /Trio/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /Love Letter/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('ignore les parties d’un jeu qui n’existe plus', async () => {
    store('masterscards:history', [ENTRY('1', { gameId: 'inconnu' })])
    renderApp('/scores')
    expect(await screen.findByText('Aucune partie pour le moment')).toBeInTheDocument()
  })
})

describe('réglages', () => {
  it('propose le français, les autres langues sont grisées', async () => {
    renderApp('/reglages')
    expect(await screen.findByRole('radio', { name: 'Français' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'English' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Español' })).toBeDisabled()
  })

  it('n’a ni compte ni déconnexion', async () => {
    renderApp('/reglages')
    await screen.findByRole('heading', { level: 1, name: 'Réglages' })
    expect(screen.queryByText(/compte/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/connecter/i)).not.toBeInTheDocument()
  })

  it('mène à la page À propos', async () => {
    renderApp('/reglages')
    expect(await screen.findByRole('link', { name: 'À propos' })).toHaveAttribute('href', '/a-propos')
  })
})

// Même chemin pour tous les jeux, à chaque fois : « Jouer » ouvre « Tes cartes », même après un tutoriel fini.
describe.each(games.map((game) => [game.id, game] as const))('« Jouer » : %s', (id, game) => {
  it('ouvre « Tes cartes »', async () => {
    renderApp(`/jeu/${id}`)
    expect(await screen.findByRole('link', { name: 'Jouer' })).toHaveAttribute('href', `/jeu/${id}/tutoriel/cartes`)
  })

  it('ouvre encore « Tes cartes » après avoir fini le tutoriel', async () => {
    // Dernier écran du tutoriel : « Compter les points » si le jeu en a un, sinon « Un tour ».
    const first = renderApp(`/jeu/${id}/tutoriel/${game.points ? 'points' : 'tour'}`)
    await userEvent.click(await screen.findByRole('link', { name: 'Jouer' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Qui joue ?' })).toBeInTheDocument()
    first.unmount()

    renderApp(`/jeu/${id}`)
    expect(await screen.findByRole('link', { name: 'Jouer' })).toHaveAttribute('href', `/jeu/${id}/tutoriel/cartes`)
  })
})
