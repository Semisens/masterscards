/**
 * Toutes les adresses de l'app, au même endroit.
 *
 *   /                                   accueil : choix du jeu
 *   /jeu/:id                            le jeu : « Jouer » ou « Règles complètes »
 *   /jeu/:id/regles                     règles complètes
 *   /jeu/:id/tutoriel/cartes            « Tes cartes » : vue liste (bascule Classique / Connaisseur)
 *   /jeu/:id/tutoriel/cartes/:groupe    vue à balayer d'un groupe de cartes (à partir de 1)
 *   /jeu/:id/tutoriel/mise-en-place     mise en place
 *   /jeu/:id/tutoriel/tour              un tour de jeu
 *   /jeu/:id/tutoriel/points            compter les points (facultatif, `points` du jeu ; avec `?depuis=scores` :
 *                                       ouvert depuis la saisie des scores, retour à la saisie)
 *   /jeu/:id/joueurs                    qui joue ? (avec `?depuis=partie` : pour noter les scores, retour à la partie)
 *   /jeu/:id/partie                     partie en cours
 *   /jeu/:id/partie/scores              saisie des scores (trios gagnés, fin de manche)
 *   /jeu/:id/resultat/:partieId         podium d'une partie terminée ou interrompue
 *   /scores                             historique des parties
 *   /reglages                           réglages
 *   /a-propos                           mentions légales
 *
 * Depuis « Partie en cours », les tuiles ouvrent règles, cartes, mise en place et tour avec `?depuis=partie` :
 * le retour mène alors à la partie, pas au tutoriel.
 */
export const FROM_PARTY = { param: 'depuis', value: 'partie' } as const
/** « Compter les points » ouvert depuis la saisie des scores : le retour y ramène. */
export const FROM_SCORES = { param: 'depuis', value: 'scores' } as const

const fromParty = (path: string, party: boolean) => (party ? `${path}?${FROM_PARTY.param}=${FROM_PARTY.value}` : path)

export const paths = {
  home: () => '/',
  about: () => '/a-propos',
  game: (id: string) => `/jeu/${id}`,
  rules: (id: string, party = false) => fromParty(`/jeu/${id}/regles`, party),
  cards: (id: string, party = false) => fromParty(`/jeu/${id}/tutoriel/cartes`, party),
  group: (id: string, group: number, party = false) => fromParty(`/jeu/${id}/tutoriel/cartes/${group}`, party),
  setup: (id: string, party = false) => fromParty(`/jeu/${id}/tutoriel/mise-en-place`, party),
  turn: (id: string, party = false) => fromParty(`/jeu/${id}/tutoriel/tour`, party),
  points: (id: string, fromScores = false) =>
    `/jeu/${id}/tutoriel/points${fromScores ? `?${FROM_SCORES.param}=${FROM_SCORES.value}` : ''}`,
  players: (id: string, party = false) => fromParty(`/jeu/${id}/joueurs`, party),
  party: (id: string) => `/jeu/${id}/partie`,
  scores: (id: string) => `/jeu/${id}/partie/scores`,
  results: (id: string, partyId: string) => `/jeu/${id}/resultat/${partyId}`,
  history: () => '/scores',
  settings: () => '/reglages',
}
