// Textes de l'interface (français, tutoiement, phrases courtes). Les clés sont stables : une autre langue
// ajoutera un fichier de même forme. Le contenu des jeux, lui, vit dans src/content/games/<id>/game.yaml.

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** Le principe de l'app : mot de bienvenue au premier lancement, et premier panneau d'« À propos ». */
const PRINCIPLE =
  'Tu as oublié ton jeu de société favori ? Pas de panique : un jeu de 54 cartes suffit. Pour chaque jeu, MastersCards te dit quelles cartes garder, ce que chacune représente, et t’apprend à jouer pas à pas.'

export const fr = {
  app: { name: 'MastersCards' },
  nav: {
    back: 'Retour',
    backToParty: 'Retour à la partie',
    quitTutorial: 'Quitter le tutoriel',
    skip: 'Passer cette étape',
    next: 'Suivant',
    play: 'Jouer',
    finish: 'Terminer',
  },
  tabs: {
    label: 'Navigation principale',
    games: 'Jeux',
    scores: 'Scores',
    settings: 'Réglages',
  },
  home: {
    title: 'Tes jeux',
    searchLabel: 'Recherche',
    searchPlaceholder: 'Un jeu, un titre…',
    filtersLabel: 'Filtres',
    filterAll: 'Tous',
    filterTwo: '2 joueurs',
    filterQuick: 'Rapide',
    filterNoJoker: 'Sans joker',
    emptyTitle: 'Aucun jeu pour le moment',
    emptyText: 'Les jeux arrivent bientôt. Reviens vite !',
    noMatchTitle: 'Aucun jeu trouvé',
    noMatchText: 'Essaie un autre mot, ou choisis « Tous ».',
    welcomeTitle: 'Bienvenue !',
    welcomeText: PRINCIPLE,
    welcomeDismiss: 'C’est compris',
  },
  history: {
    title: 'Tes scores',
    games: (count: number) => `${count} ${count > 1 ? 'parties' : 'partie'}`,
    finished: 'Terminée',
    interrupted: 'Interrompue',
    emptyTitle: 'Aucune partie pour le moment',
    emptyText: 'Tes parties apparaîtront ici quand tu les auras terminées.',
  },
  settings: {
    title: 'Réglages',
    language: 'Langue de l’app',
    languageSoon: 'English et Español arrivent bientôt.',
    about: 'À propos',
    news: 'Nouveautés',
  },
  news: {
    title: 'Nouveautés',
    close: 'Fermer',
    done: 'C’est compris',
    seeGame: 'Voir le jeu',
    previous: 'Nouveauté précédente',
    next: 'Nouveauté suivante',
    counter: (n: number, total: number) => `Nouveauté ${n} sur ${total}`,
  },
  mode: {
    legend: 'Mode de lecture',
    classic: 'Classique',
    expert: 'Connaisseur',
  },
  game: {
    /** « 3 à 6 joueurs » pour les vignettes. */
    players: (min: number, max: number) => (min === max ? plural(min, 'joueur', 'joueurs') : `${min} à ${max} joueurs`),
    /** « 3–6 joueurs · 15 min » pour le bandeau du jeu. */
    facts: (min: number, max: number, minutes: number) =>
      `${min === max ? min : `${min}–${max}`} joueur${max > 1 ? 's' : ''} · ${minutes} min`,
    play: 'Jouer',
    fullRules: 'Règles complètes',
  },
  cards: {
    title: 'Tes cartes',
    remove: (list: string) => `Retire ${list}.`,
    keep: (count: number) => `Garde ${plural(count, 'carte', 'cartes')}.`,
    keepAll: 'Garde tout le paquet.',
    /** Tout le paquet de 52, plus des jokers : rien à retirer. */
    keepAllWithJokers: (jokers: number) =>
      `Garde tout le paquet, avec ${jokers > 1 ? `les ${jokers} jokers` : 'le joker'}. Ne retire rien.`,
    /** Titre de la rangée des cartes d'origine, en mode connaisseur. */
    originalCards: 'Dans le jeu d’origine',
    /** Libellé d'un joker pour lecteurs d'écran. */
    jokerLabel: 'Joker',
    /** Quand les cartes à retirer ne se disent pas en une liste (couleurs et valeurs entières). */
    keepOnly: (count: number, jokers = 0) =>
      `Garde ces ${plural(count, 'carte', 'cartes')}${jokers > 0 ? `, dont ${plural(jokers, 'joker', 'jokers')}` : ''}. Retire tout le reste du paquet.`,
    /** Nombre de cartes d'un groupe, après le titre de la ligne : « 15 cartes ». */
    count: (count: number) => plural(count, 'carte', 'cartes'),
    /** Titre de la vue à balayer : « ×15 · Valent 2 à 6. ». */
    countAndShort: (count: number, short: string) => `×${count} · ${short}`,
    groupCounter: (word: string, current: number, total: number) => `${word} ${current} / ${total}`,
    groupWord: 'Groupe',
    previousGroup: 'Groupe précédent',
    nextGroup: 'Groupe suivant',
    /** Ligne grise de la vue à balayer en mode connaisseur. */
    expertNote: (original: string, several: boolean, power?: string, name?: string) =>
      `Connaisseur : ${name ?? `${several ? 'cartes' : 'carte'} ${original} du jeu d’origine`}.${power ? ` Pouvoir d’origine : ${power}${/[.!?]$/.test(power) ? '' : '.'}` : ''}`,
    dots: 'Position dans les groupes de cartes',
  },
  rules: {
    title: 'Règles complètes',
  },
  points: {
    title: 'Compter les points',
    /** Pastille de droite d'une ligne : « 7 points ». */
    value: (n: number) => plural(n, 'point', 'points'),
    list: 'Points de chaque carte',
    /** Lien de la saisie des scores. */
    link: 'Compter les points',
    backToScores: 'Retour aux scores',
  },
  party: {
    title: 'Partie en cours',
    rules: 'Règles',
    setup: 'Mise en place',
    cards: 'Cartes',
    turn: 'Un tour',
    enterScores: 'Noter les scores',
    end: 'Terminer la partie',
    players: 'Joueurs de la partie',
  },
  results: {
    finished: 'Partie terminée',
    interrupted: 'Partie interrompue',
    title: 'Podium',
    /** Rang d'un joueur : « 1er », « 4e » (lecteurs d'écran, et la liste après les médailles). */
    place: (rank: number) => (rank === 1 ? '1er' : `${rank}e`),
    /** Médaille des trois premiers (ex aequo : la même), le rang ensuite (« 4e »). */
    medal: (rank: number) => ['🥇', '🥈', '🥉'][rank - 1] ?? (rank === 1 ? '1er' : `${rank}e`),
    seeHistory: 'Voir l’historique',
    backToGames: 'Retour aux jeux',
    notFound: 'Cette partie est introuvable.',
    podium: 'Podium des joueurs',
  },
  players: {
    title: 'Qui joue ?',
    intro: 'Écris le prénom de chaque joueur.',
    introForScores: 'Pour noter les scores, écris le prénom de chaque joueur.',
    count: 'Joueurs',
    fewer: 'Un joueur de moins',
    more: 'Un joueur de plus',
    defaultName: (n: number) => `Joueur ${n}`,
    nameLabel: (n: number) => `Prénom du joueur ${n}`,
    start: 'C’est parti',
  },
  about: {
    title: 'À propos',
    principleTitle: 'Le principe',
    principle: PRINCIPLE,
    legalTitle: 'Mentions',
    disclaimer: 'Application non officielle, sans lien avec les éditeurs des jeux cités.',
    namesNote: 'Leurs noms sont cités à titre descriptif, les règles dites avec nos propres mots.',
    fonts: 'Polices : Fredoka, Nunito et Great Vibes, sous licence libre SIL Open Font License.',
    versionTitle: 'Version',
    privacy: 'Aucune donnée n’est collectée : ni compte, ni connexion.',
  },
  errors: {
    notFoundTitle: 'Oups, introuvable',
    gameNotFound: 'Ce jeu n’existe pas ou n’est plus disponible.',
    groupNotFound: 'Ce groupe de cartes n’existe pas.',
    pageNotFound: 'Cette page n’existe pas.',
    backHome: 'Retour à l’accueil',
  },
}
