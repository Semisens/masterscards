import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getGame } from './data/games.ts'
import { renderApp } from './test/renderApp.tsx'

const trio = getGame('trio')!
const SESSION_KEY = 'masterscards:session:trio'
const PARTY = {
  players: [
    { name: 'Léa', score: 2 },
    { name: 'Tom', score: 1 },
    { name: 'Inès', score: 0 },
  ],
  round: 1,
}
const seedParty = () => window.localStorage.setItem(SESSION_KEY, JSON.stringify(PARTY))
const savedParty = () => JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? 'null')

beforeEach(() => window.localStorage.clear())

describe('accueil', () => {
  it('affiche Trio avec ses joueurs et sa durée, et mène à la page du jeu', async () => {
    renderApp('/')
    const tile = await screen.findByRole('link', { name: /Trio/ })
    expect(tile).toHaveAttribute('href', '/jeu/trio')
    expect(tile).toHaveTextContent('3–6 joueurs · 15 min')
  })

  it('ne propose pas le choix du mode : il se fait après le choix du jeu', async () => {
    renderApp('/')
    await screen.findByRole('link', { name: /Trio/ })
    // Les pastilles de filtre sont des boutons radio : on vérifie qu'aucun n'est le mode de lecture.
    expect(screen.queryByRole('radio', { name: 'Classique' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Connaisseur' })).not.toBeInTheDocument()
  })

  it('affiche un mot de bienvenue au premier lancement, une seule fois', async () => {
    const first = renderApp('/')
    expect(await screen.findByText('Bienvenue !')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'C’est compris' }))
    expect(screen.queryByText('Bienvenue !')).not.toBeInTheDocument()
    first.unmount()

    renderApp('/')
    await screen.findByRole('link', { name: /Trio/ })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.queryByText('Bienvenue !')).not.toBeInTheDocument()
  })

  it('n’a plus de lien À propos : il est dans les Réglages', async () => {
    renderApp('/')
    await screen.findByRole('link', { name: /Trio/ })
    expect(screen.queryByRole('link', { name: 'À propos' })).not.toBeInTheDocument()
  })
})

describe('page du jeu', () => {
  it('affiche le bandeau du jeu : nom, joueurs et durée', async () => {
    renderApp('/jeu/trio')
    expect(await screen.findByRole('heading', { level: 1, name: 'Trio' })).toBeInTheDocument()
    expect(screen.getByText('3–6 joueurs · 15 min')).toBeInTheDocument()
  })

  it('affiche la phrase d’accroche et le texte du jeu', async () => {
    renderApp('/jeu/trio')
    expect(await screen.findByText(trio.tagline)).toBeInTheDocument()
    expect(screen.getByText(trio.description, { exact: false })).toBeInTheDocument()
  })

  it('propose « Jouer » (le tutoriel) et « Règles complètes »', async () => {
    renderApp('/jeu/trio')
    expect(await screen.findByRole('link', { name: 'Jouer' })).toHaveAttribute('href', '/jeu/trio/tutoriel/cartes')
    expect(screen.getByRole('link', { name: 'Règles complètes' })).toHaveAttribute('href', '/jeu/trio/regles')
  })

  it('ne propose pas le choix du mode ici : il est dans « Tes cartes »', async () => {
    renderApp('/jeu/trio')
    await screen.findByRole('link', { name: 'Jouer' })
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('revient à la liste des jeux', async () => {
    renderApp('/jeu/trio')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/')
  })

  it('explique quand le jeu n’existe pas', async () => {
    renderApp('/jeu/inconnu')
    expect(await screen.findByText('Ce jeu n’existe pas ou n’est plus disponible.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '/')
  })
})

describe('« Tes cartes » : vue liste', () => {
  it('liste les 6 groupes de cartes, chacun menant à sa vue à balayer', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    expect(await screen.findByRole('heading', { level: 1, name: 'Tes cartes' })).toBeInTheDocument()
    const rows = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.includes('/tutoriel/cartes/'))
    expect(rows.map((r) => r.getAttribute('href'))).toEqual(
      [1, 2, 3, 4, 5, 6].map((n) => `/jeu/trio/tutoriel/cartes/${n}`),
    )
    expect(rows[1]).toHaveTextContent('2 à 6')
    expect(rows[1]).toHaveTextContent('15 cartes')
    expect(rows[1]).toHaveTextContent('Valent 2 à 6.')
    expect(rows[2]).toHaveTextContent('Spécial')
    expect(rows[2]).toHaveTextContent('3 cartes')
    expect(rows[2]).toHaveTextContent('Trio de 7 = victoire.')
  })

  it('annonce ce qu’il faut retirer et garder', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    expect(await screen.findByText('Retire les carreaux et les rois. Garde 36 cartes.')).toBeInTheDocument()
  })

  it('choisit le mode ici : Classique par défaut', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    expect(await screen.findByRole('radio', { name: 'Classique' })).toBeChecked()
  })

  it('mode connaisseur : la même liste, avec la correspondance en plus', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    await userEvent.click(await screen.findByRole('radio', { name: 'Connaisseur' }))
    const rows = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.includes('/tutoriel/cartes/'))
    expect(rows).toHaveLength(6)
    expect(rows[1]).toHaveTextContent('2–6')
    expect(rows[1]).toHaveTextContent('Valent 2 à 6.')
    expect(rows[4]).toHaveTextContent('11')
    expect(rows[5]).toHaveTextContent('12')
    expect(screen.queryByText(/Jeu d’origine/)).not.toBeInTheDocument()
  })

  it('mémorise le mode choisi', async () => {
    const first = renderApp('/jeu/trio/tutoriel/cartes')
    await userEvent.click(await screen.findByRole('radio', { name: 'Connaisseur' }))
    expect(window.localStorage.getItem('masterscards:mode')).toBe('expert')
    first.unmount()

    renderApp('/jeu/trio/tutoriel/cartes')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Connaisseur' })).toBeChecked())
  })

  it('ouvre la vue à balayer sur le groupe touché', async () => {
    const app = renderApp('/jeu/trio/tutoriel/cartes')
    await userEvent.click(await screen.findByRole('link', { name: /7.*Spécial/ }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/cartes/3')
    expect(await screen.findByText('Groupe 3 / 6')).toBeInTheDocument()
  })

  it('navigation : « Retour » en haut à gauche, « Quitter le tutoriel » en haut à droite, « Suivant » en bas', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio')
    expect(screen.getByRole('link', { name: 'Quitter le tutoriel' })).toHaveAttribute('href', '/jeu/trio')
    const next = screen.getByRole('link', { name: 'Suivant' })
    expect(next).toHaveAttribute('href', '/jeu/trio/tutoriel/mise-en-place')
    // « Suivant » est le dernier élément de l'écran, sous la liste et l'encart.
    const notice = screen.getByText('Retire les carreaux et les rois. Garde 36 cartes.')
    expect(notice.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('l’encart des cartes à retirer est sous la liste', async () => {
    renderApp('/jeu/trio/tutoriel/cartes')
    const notice = await screen.findByText('Retire les carreaux et les rois. Garde 36 cartes.')
    const lastRow = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.includes('/tutoriel/cartes/'))
      .at(-1)!
    expect(lastRow.compareDocumentPosition(notice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('ouvert depuis la partie : retour à la partie, sans tutoriel', async () => {
    renderApp('/jeu/trio/tutoriel/cartes?depuis=partie')
    expect(await screen.findByRole('button', { name: 'Retour à la partie' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Quitter le tutoriel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Suivant/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Retour$/ })).toHaveAttribute('href', '/jeu/trio/partie')
  })

  it('garde le contexte « depuis la partie » dans les liens de la liste', async () => {
    renderApp('/jeu/trio/tutoriel/cartes?depuis=partie')
    const row = await screen.findByRole('link', { name: /2 à 6/ })
    expect(row).toHaveAttribute('href', '/jeu/trio/tutoriel/cartes/2?depuis=partie')
  })
})

describe('vue à balayer', () => {
  it('montre le groupe, sa position et son explication', async () => {
    renderApp('/jeu/trio/tutoriel/cartes/3')
    expect(await screen.findByText('Groupe 3 / 6')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '7' })).toBeInTheDocument()
    expect(screen.getByText(/×3 · Le 7 est spécial\./)).toBeInTheDocument()
    expect(screen.getByText(/Cache bien ton 7 !/)).toBeInTheDocument()
  })

  it('mode classique : pas de ligne « connaisseur »', async () => {
    renderApp('/jeu/trio/tutoriel/cartes/3')
    await screen.findByText('Groupe 3 / 6')
    expect(screen.queryByText(/Connaisseur :/)).not.toBeInTheDocument()
  })

  it('mode connaisseur : ajoute la carte d’origine et son pouvoir', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/trio/tutoriel/cartes/3')
    expect(
      await screen.findByText(
        /Connaisseur : carte 7 du jeu d’origine\. Pouvoir d’origine : le trio de 7 donne la victoire immédiate\./,
      ),
    ).toBeInTheDocument()
  })

  it('mode connaisseur : accorde « cartes » quand le groupe en réunit plusieurs', async () => {
    window.localStorage.setItem('masterscards:mode', 'expert')
    renderApp('/jeu/trio/tutoriel/cartes/2')
    expect(await screen.findByText(/Connaisseur : cartes 2–6 du jeu d’origine\./)).toBeInTheDocument()
  })

  it('avance avec « Suivant » et revient avec la flèche, dans l’adresse', async () => {
    const app = renderApp('/jeu/trio/tutoriel/cartes/3')
    await userEvent.click(await screen.findByRole('button', { name: 'Suivant' }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/cartes/4')
    expect(await screen.findByText('Groupe 4 / 6')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Groupe précédent' }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/cartes/3')
  })

  it('ne recule pas avant le premier groupe', async () => {
    renderApp('/jeu/trio/tutoriel/cartes/1')
    expect(await screen.findByRole('button', { name: 'Groupe précédent' })).toBeDisabled()
  })

  it('après le dernier groupe, « Terminer » ramène à la liste', async () => {
    const app = renderApp('/jeu/trio/tutoriel/cartes/6')
    expect(await screen.findByRole('button', { name: 'Groupe suivant' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Terminer' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/tutoriel/cartes'))
  })

  it('revient à la liste', async () => {
    renderApp('/jeu/trio/tutoriel/cartes/3')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio/tutoriel/cartes')
  })

  it('compte autant de points que de groupes', async () => {
    const { container } = renderApp('/jeu/trio/tutoriel/cartes/3')
    await screen.findByText('Groupe 3 / 6')
    expect(container.querySelectorAll('[aria-hidden="true"] > span:not([style])')).toHaveLength(6)
  })

  it.each(['0', '7', 'abc', '-1', '2.5'])('refuse le groupe « %s »', async (groupe) => {
    renderApp(`/jeu/trio/tutoriel/cartes/${groupe}`)
    expect(await screen.findByText('Ce groupe de cartes n’existe pas.')).toBeInTheDocument()
  })
})

describe('mise en place', () => {
  it('affiche le schéma et les étapes numérotées', async () => {
    renderApp('/jeu/trio/tutoriel/mise-en-place')
    expect(await screen.findByRole('heading', { level: 1, name: 'Mise en place' })).toBeInTheDocument()
    expect(screen.getByText('Ta main, triée')).toBeInTheDocument()
    expect(screen.getByText('Au centre, cachées')).toBeInTheDocument()
    expect(screen.getByText(/Mélange les 36 cartes\./)).toBeInTheDocument()
    expect(screen.getByText(/Donne 9, 7, 6 ou 5 cartes par joueur/)).toBeInTheDocument()
  })

  it('passe à « un tour de jeu »', async () => {
    renderApp('/jeu/trio/tutoriel/mise-en-place')
    expect(await screen.findByRole('link', { name: 'Suivant' })).toHaveAttribute('href', '/jeu/trio/tutoriel/tour')
  })

  it('revient aux cartes', async () => {
    renderApp('/jeu/trio/tutoriel/mise-en-place')
    expect(await screen.findByRole('link', { name: /Retour$/ })).toHaveAttribute('href', '/jeu/trio/tutoriel/cartes')
  })
})

describe('un tour de jeu', () => {
  it('affiche les 4 étapes d’un tour et la façon de gagner', async () => {
    renderApp('/jeu/trio/tutoriel/tour')
    expect(await screen.findByRole('heading', { level: 1, name: 'Un tour de jeu' })).toBeInTheDocument()
    for (const label of ['1. Retourne.', '2. Compare.', '3. Trio.', '4. Raté.']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('Gagner')).toBeInTheDocument()
    expect(screen.getByText(/Réunis 3 trios\. Ou le trio de 7\./)).toBeInTheDocument()
  })

  it('« Jouer » mène à « Qui joue ? »', async () => {
    renderApp('/jeu/trio/tutoriel/tour')
    expect(await screen.findByRole('link', { name: 'Jouer' })).toHaveAttribute('href', '/jeu/trio/joueurs')
  })
})

describe('règles complètes', () => {
  it('affiche toutes les sections', async () => {
    renderApp('/jeu/trio/regles')
    expect(await screen.findByRole('heading', { level: 1, name: 'Règles complètes' })).toBeInTheDocument()
    for (const section of trio.full_rules) {
      // Un titre comme « Trio » peut aussi apparaître ailleurs sur la page : on cherche le titre de section.
      expect(screen.getAllByText(section.title).some((el) => el.tagName === 'B')).toBe(true)
      expect(screen.getByText(section.text, { exact: false })).toBeInTheDocument()
    }
  })

  it('revient au jeu', async () => {
    renderApp('/jeu/trio/regles')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio')
  })

  it('ouvertes depuis la partie, reviennent à la partie', async () => {
    renderApp('/jeu/trio/regles?depuis=partie')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio/partie')
  })
})

describe('qui joue ?', () => {
  it('propose le minimum de joueurs du jeu, avec des champs vides', async () => {
    renderApp('/jeu/trio/joueurs')
    expect(await screen.findByRole('heading', { level: 1, name: 'Qui joue ?' })).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    expect(screen.getByPlaceholderText('Joueur 1')).toBeInTheDocument()
  })

  it('ajoute et retire des joueurs, dans les limites du jeu (3 à 6)', async () => {
    renderApp('/jeu/trio/joueurs')
    const more = await screen.findByRole('button', { name: 'Un joueur de plus' })
    const fewer = screen.getByRole('button', { name: 'Un joueur de moins' })
    expect(fewer).toBeDisabled()
    for (let i = 0; i < 3; i++) await userEvent.click(more)
    expect(screen.getAllByRole('textbox')).toHaveLength(6)
    expect(more).toBeDisabled()
    await userEvent.click(fewer)
    expect(screen.getAllByRole('textbox')).toHaveLength(5)
  })

  it('garde les prénoms déjà écrits quand on change le nombre de joueurs', async () => {
    renderApp('/jeu/trio/joueurs')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Prénom du joueur 1' }), 'Léa')
    await userEvent.click(screen.getByRole('button', { name: 'Un joueur de plus' }))
    expect(screen.getByRole('textbox', { name: 'Prénom du joueur 1' })).toHaveValue('Léa')
  })

  it('démarre la partie : joueurs à zéro, noms par défaut pour les champs vides', async () => {
    const app = renderApp('/jeu/trio/joueurs')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Prénom du joueur 1' }), 'Léa')
    await userEvent.type(screen.getByRole('textbox', { name: 'Prénom du joueur 2' }), 'Tom')
    await userEvent.click(screen.getByRole('button', { name: 'C’est parti' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    expect(savedParty()).toEqual({
      players: [
        { name: 'Léa', score: 0 },
        { name: 'Tom', score: 0 },
        { name: 'Joueur 3', score: 0 },
      ],
      round: 1,
    })
  })

  it('« Passer cette étape » (en haut, après « Retour ») démarre tout de suite, noms par défaut', async () => {
    const app = renderApp('/jeu/trio/joueurs')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Prénom du joueur 1' }), 'Léa')
    expect(screen.queryByRole('link', { name: 'Quitter le tutoriel' })).not.toBeInTheDocument()
    const header = screen.getByRole('link', { name: /Retour/ }).parentElement!
    expect(header.lastElementChild).toBe(screen.getByRole('button', { name: 'Passer cette étape' }))
    await userEvent.click(screen.getByRole('button', { name: 'Passer cette étape' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    // Le prénom tapé est laissé de côté ; le nombre de joueurs reste celui de l'écran.
    expect(savedParty()).toEqual({
      players: [
        { name: 'Joueur 1', score: 0 },
        { name: 'Joueur 2', score: 0 },
        { name: 'Joueur 3', score: 0 },
      ],
      round: 1,
      unnamed: true,
    })
  })

  it('« Passer cette étape » garde le nombre de joueurs réglé', async () => {
    const app = renderApp('/jeu/trio/joueurs')
    await userEvent.click(await screen.findByRole('button', { name: 'Un joueur de plus' }))
    await userEvent.click(screen.getByRole('button', { name: 'Passer cette étape' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    expect(savedParty().players).toHaveLength(4)
  })

  it('sans prénoms : la partie n’a pas de jetons, et « Noter les scores » demande les prénoms', async () => {
    const app = renderApp('/jeu/trio/joueurs')
    await userEvent.click(await screen.findByRole('button', { name: 'Passer cette étape' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    expect(screen.queryByRole('group', { name: 'Joueurs de la partie' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Joueur 1/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Noter les scores' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/joueurs?depuis=partie'))
    expect(screen.getByText('Pour noter les scores, écris le prénom de chaque joueur.')).toBeInTheDocument()
    // Les champs sont vides (« Joueur 1 » n'est qu'un repli), le nombre de joueurs est gardé, pas de pastille « Passer ».
    expect(screen.getByRole('textbox', { name: 'Prénom du joueur 1' })).toHaveValue('')
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Passer cette étape' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio/partie')

    await userEvent.type(screen.getByRole('textbox', { name: 'Prénom du joueur 1' }), 'Léa')
    await userEvent.click(screen.getByRole('button', { name: 'C’est parti' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie/scores'))
    expect(savedParty().players[0].name).toBe('Léa')
    expect(savedParty().unnamed).toBeUndefined()
  })

  it('sans prénom, « C’est parti » est grisé : on passe par « Passer cette étape »', async () => {
    renderApp('/jeu/trio/joueurs')
    const start = await screen.findByRole('button', { name: 'C’est parti' })
    expect(start).toBeDisabled()
    // Changer le nombre de joueurs ne suffit pas, ni des espaces seuls.
    await userEvent.click(screen.getByRole('button', { name: 'Un joueur de plus' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Prénom du joueur 1' }), '   ')
    expect(start).toBeDisabled()
    // Un seul prénom suffit ; l'effacer grise de nouveau le bouton.
    await userEvent.type(screen.getByRole('textbox', { name: 'Prénom du joueur 2' }), 'Tom')
    expect(start).toBeEnabled()
    await userEvent.clear(screen.getByRole('textbox', { name: 'Prénom du joueur 2' }))
    expect(start).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Passer cette étape' })).toBeEnabled()
  })

  it('en venant de la partie, sans prénom, « C’est parti » est grisé (et il n’y a pas de « Passer »)', async () => {
    renderApp('/jeu/trio/joueurs?depuis=partie')
    expect(await screen.findByRole('button', { name: 'C’est parti' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Passer cette étape' })).not.toBeInTheDocument()
  })

  it('ne reprend pas les prénoms de la partie en cours, seulement leur nombre', async () => {
    seedParty()
    renderApp('/jeu/trio/joueurs')
    expect(await screen.findByRole('textbox', { name: 'Prénom du joueur 2' })).toHaveValue('')
    expect(screen.getAllByRole('textbox')).toHaveLength(PARTY.players.length)
    expect(screen.getByRole('button', { name: 'C’est parti' })).toBeDisabled()
  })

  it('revient à « un tour de jeu »', async () => {
    renderApp('/jeu/trio/joueurs')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio/tutoriel/tour')
  })
})

describe('partie en cours', () => {
  it('une partie sans prénoms ne s’ouvre pas sur la saisie des scores : elle demande les prénoms', async () => {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ players: [{ name: 'Joueur 1', score: 0 }], round: 1, unnamed: true }),
    )
    const app = renderApp('/jeu/trio/partie/scores')
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/joueurs?depuis=partie'))
  })

  it('sans partie, on commence par dire qui joue', async () => {
    const app = renderApp('/jeu/trio/partie')
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/joueurs'))
  })

  it('affiche un jeton par joueur avec son nombre de trios', async () => {
    seedParty()
    renderApp('/jeu/trio/partie')
    expect(await screen.findByRole('heading', { level: 1, name: 'Partie en cours' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Léa : 2' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Tom : 1' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Inès : 0' })).toBeInTheDocument()
  })

  it('offre quatre raccourcis qui gardent le contexte « depuis la partie »', async () => {
    seedParty()
    renderApp('/jeu/trio/partie')
    const hrefOf = async (name: string) => (await screen.findByRole('link', { name })).getAttribute('href')
    expect(await hrefOf('Règles')).toBe('/jeu/trio/regles?depuis=partie')
    expect(await hrefOf('Mise en place')).toBe('/jeu/trio/tutoriel/mise-en-place?depuis=partie')
    expect(await hrefOf('Cartes')).toBe('/jeu/trio/tutoriel/cartes?depuis=partie')
    expect(await hrefOf('Un tour')).toBe('/jeu/trio/tutoriel/tour?depuis=partie')
  })

  it('mène à la saisie des scores', async () => {
    seedParty()
    renderApp('/jeu/trio/partie')
    expect(await screen.findByRole('link', { name: 'Noter les scores' })).toHaveAttribute(
      'href',
      '/jeu/trio/partie/scores',
    )
  })

  it('« Retour » garde la partie', async () => {
    seedParty()
    renderApp('/jeu/trio/partie')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio')
    expect(savedParty()).toEqual(PARTY)
  })

  it('« Terminer la partie » l’efface, l’archive comme interrompue et ouvre le podium', async () => {
    seedParty()
    const app = renderApp('/jeu/trio/partie')
    await userEvent.click(await screen.findByRole('button', { name: 'Terminer la partie' }))
    await waitFor(() => expect(app.location()).toMatch(/^\/jeu\/trio\/resultat\/\d+$/))
    expect(savedParty()).toBeNull()
    const history = JSON.parse(window.localStorage.getItem('masterscards:history') ?? '[]')
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({ gameId: 'trio', status: 'interrupted' })
    expect(await screen.findByText('Partie interrompue')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Podium' })).toBeInTheDocument()
  })

  it('une donnée abîmée équivaut à pas de partie', async () => {
    window.localStorage.setItem(SESSION_KEY, '{abîmé')
    const app = renderApp('/jeu/trio/partie')
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/joueurs'))
  })
})

// La saisie est la même pour tous les jeux : les compteurs partent de zéro, Valider ajoute et passe à la manche suivante.
describe('trios gagnés', () => {
  it('affiche un compteur par joueur, qui part de zéro', async () => {
    seedParty()
    renderApp('/jeu/trio/partie/scores')
    expect(await screen.findByRole('heading', { level: 1, name: 'Trios gagnés' })).toBeInTheDocument()
    expect(screen.getByText('Qui a gagné un trio ?')).toBeInTheDocument()
    expect(screen.getByText('Léa')).toBeInTheDocument()
    expect(screen.getByText('Inès')).toBeInTheDocument()
    expect(screen.getByLabelText('Léa : 0')).toBeInTheDocument()
  })

  it('compte sans rien enregistrer avant « Valider »', async () => {
    seedParty()
    renderApp('/jeu/trio/partie/scores')
    await userEvent.click(await screen.findByRole('button', { name: 'Un trio de plus pour Inès' }))
    expect(screen.getByLabelText('Inès : 1')).toBeInTheDocument()
    expect(savedParty()).toEqual(PARTY)
  })

  it('ne descend pas sous zéro', async () => {
    seedParty()
    renderApp('/jeu/trio/partie/scores')
    expect(await screen.findByRole('button', { name: 'Un trio de moins pour Inès' })).toBeDisabled()
  })

  it('ajoute les trios gagnés à « Valider » et revient à la partie', async () => {
    seedParty()
    const app = renderApp('/jeu/trio/partie/scores')
    await userEvent.click(await screen.findByRole('button', { name: 'Un trio de plus pour Inès' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    expect(savedParty().players.map((p: { score: number }) => p.score)).toEqual([2, 1, 1])
  })

  it('termine la partie au troisième trio et ouvre le podium', async () => {
    seedParty()
    const app = renderApp('/jeu/trio/partie/scores')
    await userEvent.click(await screen.findByRole('button', { name: 'Un trio de plus pour Léa' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await waitFor(() => expect(app.location()).toMatch(/^\/jeu\/trio\/resultat\/\d+$/))
    expect(await screen.findByText('Partie terminée')).toBeInTheDocument()
  })

  it('revient à la partie sans enregistrer', async () => {
    seedParty()
    renderApp('/jeu/trio/partie/scores')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/jeu/trio/partie')
  })

  it('sans partie, on commence par dire qui joue', async () => {
    const app = renderApp('/jeu/trio/partie/scores')
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/joueurs'))
  })
})

describe('adresses invalides', () => {
  it.each([
    '/jeu/inconnu/regles',
    '/jeu/inconnu/tutoriel/cartes',
    '/jeu/inconnu/tutoriel/cartes/1',
    '/jeu/inconnu/tutoriel/mise-en-place',
    '/jeu/inconnu/tutoriel/tour',
    '/jeu/inconnu/joueurs',
    '/jeu/inconnu/partie',
    '/jeu/inconnu/partie/scores',
  ])('un jeu inconnu : %s', async (path) => {
    renderApp(path)
    expect(await screen.findByText('Ce jeu n’existe pas ou n’est plus disponible.')).toBeInTheDocument()
  })

  it('affiche une page introuvable pour toute autre adresse', async () => {
    renderApp('/n-importe-quoi')
    expect(await screen.findByText('Cette page n’existe pas.')).toBeInTheDocument()
  })

  it('l’ancienne adresse d’une règle en étapes est introuvable', async () => {
    renderApp('/jeu/trio/classique/regle')
    expect(await screen.findByText('Cette page n’existe pas.')).toBeInTheDocument()
  })
})

describe('à propos', () => {
  it('affiche l’avertissement légal exigé par le cahier des charges', async () => {
    renderApp('/a-propos')
    expect(
      await screen.findByText('Application non officielle, sans lien avec les éditeurs des jeux cités.'),
    ).toBeInTheDocument()
  })

  it('revient aux Réglages', async () => {
    renderApp('/a-propos')
    expect(await screen.findByRole('link', { name: /Retour/ })).toHaveAttribute('href', '/reglages')
  })
})

describe('parcours complet', () => {
  it('du choix du jeu à la partie : cartes, mise en place, tour, joueurs, scores', async () => {
    const app = renderApp('/jeu/trio')
    await userEvent.click(await screen.findByRole('link', { name: 'Jouer' }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/cartes')
    await userEvent.click(await screen.findByRole('link', { name: /Suivant/ }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/mise-en-place')
    await userEvent.click(await screen.findByRole('link', { name: 'Suivant' }))
    expect(app.location()).toBe('/jeu/trio/tutoriel/tour')
    await userEvent.click(await screen.findByRole('link', { name: 'Jouer' }))
    expect(app.location()).toBe('/jeu/trio/joueurs')

    await userEvent.type(await screen.findByRole('textbox', { name: 'Prénom du joueur 1' }), 'Léa')
    await userEvent.click(screen.getByRole('button', { name: 'C’est parti' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))

    await userEvent.click(await screen.findByRole('link', { name: 'Noter les scores' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Un trio de plus pour Léa' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await waitFor(() => expect(app.location()).toBe('/jeu/trio/partie'))
    const chip = await screen.findByRole('img', { name: 'Léa : 1' })
    expect(within(chip.parentElement!).getByText('Léa')).toBeInTheDocument()
  })
})
