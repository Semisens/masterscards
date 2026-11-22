# MastersCards : consignes pour Claude Code

- Spécification complète : `docs/CAHIER_DES_CHARGES.md`. Lis-le en premier.
- Tokens de design : `charte/masterscards-charte.json`. Ne jamais écrire une couleur, un rayon, un espacement ou une taille de texte en dur : tout passe par les variables `--mc-*` générées (`npm run tokens`). Le test `scripts/no-hardcoded-values.test.ts` fait échouer le build sinon.
- Contexte produit : `docs/contexte/masterscards-contexte.md`.
- Maquettes : `maquettes/<jeu>/*.png`, rendues par `npm run maquettes` depuis `maquettes/<jeu>/source/*.html` (voir `maquettes/LISEZ-MOI.md`).
- Stack : **PWA** en Vite + React + TypeScript strict, empaquetée pour iOS et Android avec **Capacitor**. Base 390x844, portrait uniquement.
- Textes de l'app : tutoiement, phrases courtes, français.
- Ne jamais reproduire de logo, lettrage ou illustration officiels d'un jeu.
- Texte minimum 16 px, zones tactiles minimum 44 px, contraste >= 4.5.
- Travaille par jalons (section 12 du cahier des charges).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (régénère les tokens). Page de visite : `/dev/design-system` (dev uniquement). |
| `npm run dev:phone` | Démarre le serveur de dev (s'il ne tourne pas) et ouvre la fenêtre au format téléphone, en une commande. `npm run phone` seul ouvre la fenêtre quand le serveur tourne déjà. |
| `npm run lint` | oxlint + Prettier (vérification). `npm run format` pour corriger. |
| `npm run typecheck` | `tsc -b` en mode strict. |
| `npm test` | Vitest : unitaires, composants, garde-fou « aucune valeur en dur ». |
| `npm run test:visual` | Playwright : PWA (hors ligne, manifeste), parcours de l’app sur le build de production (dont `e2e/jeux.spec.ts` : le même parcours pour chaque jeu), captures des écrans à 390x844. |
| `npm run build` | Build de production dans `dist/` (service worker inclus). |
| `npm run cap:sync` | Build puis copie dans les projets natifs `android/` et `ios/`. |
| `npm run tokens` / `npm run icons` | Régénèrent les tokens et les icônes depuis la charte. |
| `npm run maquettes` | Rend les maquettes HTML en images de référence (`maquettes/trio/*.png`). |
| `npm run planche -- <planche.png> <dossier-du-jeu> <préfixe>` | Découpe une planche de cartes en `<préfixe>-01.webp`… (fond transparent) : cartes d'origine d'un jeu (`expert.cards[].image`). |

## Façon de travailler (hooks git)

Le flux : Jeremy demande → tu développes vite → Jeremy valide avec `npm run dev` → commit → plusieurs commits → push. Les tests sont lancés **par les hooks git** (`.githooks/`, installés par `npm install` via `prepare`), jamais par toi.

- On travaille **directement sur `main`** : pas de branche ni de PR par demande.
- **Ne lance aucun test** : ni `npm test`, ni `npm run test:visual` / Playwright, ni lint, ni typecheck. Écris le code et laisse Jeremy le regarder.
- **Commit** (seulement quand Jeremy le demande) : le hook `pre-commit` lance les tests unitaires (`npm test`).
- **Push** (seulement quand Jeremy le demande, après plusieurs commits) : le hook `pre-push` vérifie que les tokens générés sont à jour, puis lance lint, typecheck et `npx playwright test` (PWA, parcours de chaque jeu, fidélité aux maquettes, captures).
- **Déploiement** : lancé à la main par Jeremy, onglet Actions → « Pages » → « Run workflow » sur `main`, en choisissant `patch`, `minor` ou `major` (ou `gh workflow run Pages --ref main -f version=patch`). L'action incrémente la version (`npm version`), pousse sur `main` le commit « Version x.y.z » et l'étiquette `vx.y.z` (hooks coupés dans l'action : les tests ont tourné au push), puis publie : **`git pull` après chaque publication**. `.github/workflows/pages.yml` construit `main` et publie la PWA sur GitHub Pages : https://semisens.github.io/masterscards/ (build avec `BASE_PATH=/masterscards/`). Pousse `main` avant.
- **Un hook échoue** : lis son message, corrige, recommite ou repousse. Jamais `--no-verify`, sauf demande explicite de Jeremy.
- **Une capture a changé volontairement** (le pre-push échoue sur un écran modifié) : montre l'écart à Jeremy et attends son accord. Ensuite seulement : `npx playwright test --update-snapshots`, regarde les images, commite la mise à jour, repousse.
- Le tableau « Commandes » ci-dessus sert à Jeremy et aux hooks.

### Patches (`PATCHES.md`, local, non versionné)

Jeremy note de petites évolutions dans `PATCHES.md` (racine, dans `.gitignore`). Quand il dit « dépile les patches » :

1. Prends **le premier patch du haut**, un seul par cycle.
2. Passe en **mode plan** et pose tes questions ; il valide le plan.
3. Développe. Il teste à la main (`npm run dev`).
4. Commit quand il le demande (le hook lance les tests). **Ensuite seulement**, retire ce patch de `PATCHES.md`.
   Le fichier reste, même vide : ne le supprime jamais.

## Parcours de l'app

**Navigation identique partout** (cahier §7.9 bis) : « ‹ Retour » en haut à gauche, « Quitter le tutoriel » en haut à droite (tutoriel) ou « Passer cette étape » (« Qui joue ? »), le bouton principal (« Suivant ») toujours en bas. `StepHeader` ne prend que des adresses (ou `onSkip`), pas de libellé.

Accueil « Tes jeux » (recherche, filtres, onglets Jeux / Scores / Réglages) → le jeu (« Jouer » ou « Règles complètes ») → tutoriel : **Tes cartes** (liste, bandeau « Retire… » en bas ; **le mode Classique / Connaisseur se choisit ici**, jamais à l'accueil) → vue à balayer d'un groupe → mise en place → un tour → (Compter les points, si le jeu a `points`) → Qui joue ? → partie en cours ⇄ saisie des scores → podium → historique (`/scores`). Réglages : `/reglages` (langue, À propos). « Jouer » ouvre toujours « Tes cartes » : pas de raccourci qui dépende de l'historique. Adresses dans `src/routes.ts`.

**La main** : un groupe de plusieurs rangs se montre en éventail de 2 ou 3 cartes (`CardHand`, règle dans `src/data/hand.ts`) ; un groupe d'un seul rang (A, 7, Valet, Dame) ou de jokers reste une carte seule. Aucun champ YAML : elle se déduit des cartes.

**Les écrans sont ceux des maquettes** : `maquettes/<jeu>/*.png` (rendues par `npm run maquettes` depuis `maquettes/<jeu>/source/*.html`). Trio : 9 écrans. Love Letter : 14 écrans extraits de la galerie. Quand une maquette de Love Letter diverge de Trio sur une mise en page commune, celle de Trio prime. Le test `e2e/maquettes.spec.ts` compare **chaque écran à sa maquette, pixel par pixel**, et échoue au-delà de son seuil (images d'écart dans `test-results/maquettes/`). Avant de changer un écran, regarde sa maquette ; après, lance `npx playwright test --project=visual e2e/maquettes.spec.ts` et regarde les images d'écart. Les écarts voulus sont listés dans le test et dans le cahier des charges (7.10). Une nouvelle maquette : dépose la page HTML dans `maquettes/<jeu>/source/` (ajoute `*{box-sizing:border-box}` si elle vient d'une galerie), ajoute l'écran à `e2e/maquettes.spec.ts`, relance `npm run maquettes -- <jeu>`.

**Chaque écran doit tenir sans défilement vertical** (test `aucun défilement vertical` dans `e2e/visual.spec.ts`, 390 x 844 et 393 x 852). Compacte avant d'ajouter du défilement ; seules la liste de « Tes cartes » et la carte des règles complètes défilent dans leur cadre (la page, elle, ne bouge pas). Exception voulue par Jeremy : « Un tour », dont la table (`CardTable`) est exactement celle de la mise en place (quelques cartes retournées), défile au besoin.

## Ajouter un jeu

Tous les jeux ont les mêmes écrans et le même fonctionnement. **Un jeu = une configuration, sans code.**

1. Copie `docs/modele-jeu.yaml` (modèle commenté) dans `src/content/games/<id>/game.yaml` et remplis-le : identité, couleurs (`main_color`), joueurs, durée, cartes à garder (`card_groups[].cards`, `suits: all` pour les quatre couleurs ; `jokers: 2` pour des jokers, pris dans la boîte, comptés dans « Garde ces N cartes »), correspondances (`expert`, avec `expert.cards` pour dessiner les cartes d'origine en mode Connaisseur), mots du score (`scoring`, `target` pour une fin automatique), tutoriel (la table vue de haut : `setup.hand` et `setup.center`, et pour « Un tour » `turn.reveal`, les cartes retournées sur cette même table ; cartes de dos : `layout: single | pile | spread | grid` ; cartes de face au centre : `card`, ou des rangées `cards` avec `slots` places en pointillés ; cartes mises de côté : `aside: true`, dans le coin en bas à droite ; `turn.reveal.played.you` : ta carte posée ; jeux de plis : `turn.reveal.trick`, le pli au milieu, et `turn.reveal.next`, ta carte prête à jouer), règles complètes. Le plus petit score gagne : `scoring.lowest_wins: true`. Écran facultatif « Compter les points » (après « Un tour », et lien depuis la saisie des scores) : `points.rows`, une ligne par valeur (cartes comme `card_groups`, `points`, `expert` pour le mode Connaisseur), chaque carte gardée comptée une fois ; « Tes cartes » ne parle alors que de l'ordre ou du rôle des cartes. Exemples : `trio/game.yaml`, `love-letter/game.yaml`, `6-qui-prend/game.yaml`, `loup-garou/game.yaml` (rôles, 6 à 12 joueurs : au-delà de 6, les écrans de partie passent seuls en mise en page compacte).
2. Facultatif, dans le même dossier : un logo `svg` ou `png` (original ou redessiné) et la police du nom (`woff2` sous licence libre, avec sa licence), déclarée par `font: { file, family, weight, band_size }`. Couleurs : `main_color` (la couleur du jeu : tuile, bandeau, écran de partie) ; `shadow_color` et `text_color` (relief et texte sur `main_color`) ; `background_color` (fond de **tous** les écrans du jeu, à la place du bleu : `GameScope` pose les variables `--game-*` sur la page, que les feuilles de style lisent avec le jeton de la charte en repli) et `background_text_color` ; `card_back_color` (dos des cartes, défaut `main_color`). Ce qui n'est pas donné est calculé.
3. Lance `npm test`, puis `npx playwright test e2e/jeux.spec.ts e2e/visual.spec.ts`. Ils valident le schéma, les cartes, le contraste, les mots interdits, le ton, le parcours complet jusqu'au podium et l'absence de défilement, **pour chaque dossier de jeu**, sans les nommer. Le jeu apparaît seul sur l'accueil.
4. Calculé, ne s'écrit pas : le nombre de cartes de chaque groupe, le bandeau « Retire… Garde… », `{cards}` dans les textes (nombre de cartes gardées).
5. Pièges YAML : un texte avec « : » ou « # », ou qui commence par un chiffre, se met entre apostrophes droites (`'7'`). Pas d'accolades `{ }` autour d'un texte qui contient une virgule.
6. Les textes de l'interface sont dans `src/i18n/fr.ts`, ceux des jeux dans leur `game.yaml`. Modifier le code n'est utile que pour une **nouvelle fonction** (nouveau champ du schéma, nouvel écran).

## Annoncer une version (popup « Nouveautés »)

Seulement quand Jeremy le demande : une version sans note ne montre rien.

1. Ajoute la note **en tête** de `src/content/changelog.yaml` : `version: prochaine`, `title`, `text`, et au besoin `items` (puces) et `game` (id d'un jeu : vignette et « Voir le jeu »).
2. En dev, elle compte pour la version en cours : Réglages → « Nouveautés », ou `localStorage.setItem('masterscards:news-seen','0.0.0')` puis recharger l'accueil.
3. À la publication, `npm version` (action Pages) lance `scripts/stamp-changelog.ts` : `prochaine` devient le numéro, dans le commit « Version x.y.z ». Au lancement suivant, chaque utilisateur voit les notes qu'il n'a pas vues (5 au plus, à balayer).

## Règles du dépôt

- Fichiers `*.generated.*` : jamais édités à la main, régénérés par `npm run tokens`.
- `.npmrc` active `legacy-peer-deps` (conflit de peer optionnel entre `@vitejs/plugin-react` et Workbox). Ne pas le retirer sans vérifier que `npm install` passe.
- Les rangs de cartes et valeurs de jetons sont des éléments graphiques proportionnels à l'objet. Sous environ 3,9 rem de largeur de carte, le rang passe sous 16 px : pour les cartes d’illustration, utiliser `READABLE_CARD_WIDTH` (`components/PlayingCard/sizes.ts`).
- `capacitor.config.ts` : l'identifiant `io.masterscards.app` est provisoire. Il ne peut plus changer une fois l'app publiée sur un store.
- iOS ne se compile que sur Mac (Xcode). Android demande le SDK Android (Android Studio). Sans eux, on vérifie seulement `npx cap sync`.
