# Cahier des charges : MastersCards

Version 1.4 · Plateformes : PWA installable (web) + iOS et Android via Capacitor · Base écran : 390 × 844

> Version 1.1 : passage de Flutter à une PWA (Vite + React + TypeScript) empaquetée avec Capacitor. Version 1.2 : écrans de Trio alignés sur les maquettes (charte v6). Version 1.3 : second jeu Love Letter, podium, historique, réglages, accueil « Tes jeux » à onglets ; moteur généralisé. Version 1.4 : un seul fonctionnement pour tous les jeux ; un jeu = une configuration YAML, sans code. Version 1.7 : couleurs par jeu (`main_color`, `background_color` : le fond de tous les écrans du jeu, `card_back_color`), dos de carte (piles, éventails) dans la mise en place, un tour et la partie, cartes d'origine dessinées en mode Connaisseur (`expert.cards`). Version 1.6 : palette bordeaux et sceau de cire pour Love Letter (`shadow_color`, `text_color`), plus de mise en place à 2 joueurs. Version 1.5 : Love Letter selon la règle de l'édition 2019 (10 personnages, 21 cartes dont 2 jokers, 2 à 6 joueurs) ; les jeux peuvent demander des jokers (`jokers`).
> Raisons : contenu statique et hors ligne, aucune API native nécessaire, partage par lien, référencement web, pas de review de store pour la v1. Voir `docs/contexte/masterscards-contexte.md`.

---

## 1. Présentation

### 1.1 Concept
MastersCards est une application mobile qui explique comment jouer à des **jeux de société** (Love Letter, Trio, etc.) **avec un jeu de cartes classique** (52 cartes, plus les jokers si un jeu en demande).

L'app ne sert **pas** à apprendre des jeux de cartes classiques (belote, tarot…).

### 1.2 Problème résolu
Tu as envie de jouer à un jeu de société mais tu n'as pas la boîte. Tu as un paquet de cartes. MastersCards te dit quelles cartes garder et comment jouer.

### 1.3 Cible
Joueurs occasionnels et amateurs de jeux de société, en soirée, en voyage ou en vacances.

### 1.4 Deux modes de lecture
| Mode | Pour qui | Contenu |
|---|---|---|
| **Classique** | Tout le monde | Les cartes à garder expliquées avec **ton paquet** : « Vaut 1. », « Valent 2 à 6. ». |
| **Connaisseur** | Tu connais déjà le jeu | La même vue, avec la **correspondance** avec le jeu d'origine (« 2–6 → 2 à 6 », carte d'origine en pointillés) et son pouvoir d'origine. |

Le mode se choisit **après le choix du jeu**, avec la bascule de l'écran « Tes cartes ». Il ne change que les écrans de cartes (liste et vue à balayer) : la mise en place, le tour de jeu et les règles complètes sont les mêmes dans les deux modes.

---

## 2. Périmètre

### 2.1 Inclus (v1)
- Écran d'accueil avec la liste des jeux.
- Page du jeu : « Jouer » (le tutoriel puis la partie) et « Règles complètes ».
- Tutoriel : choix des cartes (liste et vue à balayer, deux modes), mise en place, un tour de jeu.
- **Partie en cours** : les joueurs, leurs scores, la saisie des scores, des raccourcis vers les règles. Mémorisée sur l'appareil.
- Thème visuel propre à chaque jeu.
- Fonctionnement 100 % hors ligne.
- **Installable** depuis le navigateur (manifeste + service worker).
- Projets natifs **Android et iOS** générés et maintenus avec Capacitor, dès le jalon 0. La **publication sur les stores** est décidée au jalon 6, pas avant.

### 2.2 Hors périmètre (v1)
- Compte utilisateur, connexion, cloud. (L'écran « Login » et le bloc « Compte » de la galerie Love Letter ne sont pas faits.)
- Partie en ligne ou multijoueur sur plusieurs appareils.
- Gestion fine des tours : l'app **compte les points** (trios, points) et les manches, elle ne **joue** pas à la place des joueurs. Seule exception : un jeu qui déclare un score à atteindre (`scoring.target`) termine la partie quand un joueur l'atteint.
- Langues autres que le français : les réglages montrent English et Español, grisés.
- Règles de jeux de cartes classiques.
- Création de jeux par l'utilisateur (à envisager en v2).
- Achats intégrés et publicité (à trancher avec le modèle économique, question 5).

---

## 3. Ton et contenu éditorial

- **Tutoiement** partout.
- **Phrases courtes.**
- Français (v1). Prévoir l'internationalisation dès le départ (fichiers de traduction JSON par langue, clés stables).
- Le mode classique privilégie les mots simples. Un jeu peut **interdire** certains termes d'origine (champ `classic_forbidden_terms`, vérifié par test) ; pour Trio il n'y en a aucun : le nom du jeu est lui-même le vocabulaire (« trio »), et les maquettes l'emploient partout.
- Mode connaisseur : termes d'origine autorisés, utilisés dans la correspondance.

Exemple de ton : « Garde les as, les 2 et les 3. Mélange. Distribue une carte à chacun. »

---

## 4. Direction artistique

### 4.1 Ambiance
Jeu de société : **fond bleu**, formes **épaisses et arrondies**, **boutons en relief** (référence : Ludo).

### 4.2 Cartes (façon Gambit)
- Fond blanc, ratio 1,4, rayon 12.
- **Rang seul** en haut à gauche (Fredoka 700).
- **Un seul grand symbole centré** (62 % de la largeur).
- **Pas de petit symbole.**
- Rouge (`#D93A34`) et noir/encre (`#14213D`) uniquement.

### 4.3 Jetons de poker
Jaune, vert, rouge, bleu. Bord conique rayé blanc/couleur, bordure intérieure 3 px blanc 60 %, chiffres en Fredoka 700.

### 4.4 Tapis
Un tapis (couleur) par jeu : jaune, vert, rouge, bleu.

### 4.5 Tokens (source : `charte/masterscards-charte.json`)

**Couleurs**
| Token | Valeur | Usage |
|---|---|---|
| ciel | `#1E5BD6` (dégradé `#2A70E8` → `#1648B8`) | Fond principal |
| nuit | `#0E2F86` | Fond foncé, icônes |
| soleil | `#FFC928` (ombre `#B98300`) | Boutons principaux, jeton jaune |
| cerise | `#D93A34` | Rouge des cartes, alertes |
| prairie | `#2DB24E` | Succès, jeton vert |
| azur | `#36A0F5` | Accent clair |
| blanc_carte | `#FFFFFF` | Faces de cartes |
| encre | `#14213D` | Texte principal, noir des cartes |
| texte_secondaire | `#4A5675` | Texte secondaire |
| bordure | `#C9D6F2` | Bordures |

**Tapis** : jaune `#FFC928`, vert `#187A33`, rouge `#B8312C`, bleu `#2273C9`.

**Texte sur fond** : blanc sur ciel, nuit, cerise, tapis vert/rouge/bleu. Encre sur soleil, prairie, azur, tapis jaune.

**Typographie** : titres **Fredoka** 500/600/700 · textes **Nunito** 600/700/800 · **16 px minimum**.

**Rayons** : s 12 · m 20 · l 28. **Élévation (boutons en relief)** : s 4 · m 6 · l 8 px. **Espacements** : 8, 16, 24, 32, 48. **Zone tactile min.** : 44 px.

**Icônes** : trait 2,5, extrémités arrondies, couleur `#0E2F86`.

### 4.6 Implémentation
- `scripts/gen-tokens.ts` lit `charte/masterscards-charte.json` et génère `src/styles/tokens.generated.css` (variables CSS `--mc-*`) et `src/core/tokens.generated.ts` (mêmes valeurs côté TypeScript). La charte reste **la seule source** : on modifie le JSON, jamais les fichiers générés.
- **Aucune valeur de couleur, rayon, espacement ou taille de texte en dur** dans le CSS ni le TSX. Un test automatisé (`scripts/no-hardcoded-values.test.ts`) fait échouer le commit sinon (hook pre-commit).
- Les espacements et la taille de texte minimale sont exprimés en `rem`, pour suivre la taille de texte choisie par l'utilisateur.
- Polices **embarquées** : Fredoka et Nunito via `@fontsource`, la police du nom de chaque jeu dans son dossier (ex. Great Vibes, `love-letter/great-vibes.woff2`, avec sa licence OFL) ; sous-ensemble latin uniquement, précachées par le service worker. Aucune requête vers Google Fonts : l'app reste fidèle hors ligne.
- Les ombres des boutons et des jetons sont des teintes **dérivées de la charte**, calculées par le générateur (`--mc-color-cerise-ombre`, `--mc-tapis-*-ombre`). On n'utilise pas `color-mix()` en CSS : il n'existe pas avant iOS 16.2 et l'app vise iOS 15.

---

## 5. Personnalisation par jeu

Chaque jeu possède son propre thème et son propre contenu (détail et règles de validation en 9.2) :

| Champ | Description |
|---|---|
| `name` | Nom du jeu |
| `font` | Police du nom (licence libre, fichier woff2 dans le dossier du jeu). Défaut : Fredoka 700. Ex. Love Letter : Great Vibes |
| pioche | Dos de cartes à la couleur du jeu (`card_back_color`, défaut `main_color`) |
| `logo` | Optionnel. Image **originale ou redessinée**. Sinon : initiale dans un rond blanc |
| `main_color` | La couleur du jeu (le « tapis ») : jaune, vert, rouge, bleu ou libre. Texte blanc ou encre choisi **automatiquement** (contraste ≥ 4,5) |
| `shadow_color`, `text_color` | Optionnels, `#RRGGBB` : relief et texte sur `main_color`. Un texte sous 4,5 de contraste est refusé |
| `background_color`, `background_text_color` | Optionnels : le fond de **tous** les écrans du jeu, à la place du bleu de l'app (un dégradé discret en est tiré), et le texte dessus (choisi seul sinon, contraste ≥ 4,5) |
| `card_back_color` | Optionnel : la couleur du dos des cartes (défaut : `main_color`) |
| `card_groups` | Les cartes du paquet à garder, regroupées (une ligne de la liste, une page de la vue à balayer), avec leur correspondance d'origine |
| `tutorial`, `full_rules` | Mise en place, un tour de jeu, règles complètes |

Règle de contraste automatique : calculer le ratio WCAG entre la couleur de fond libre et blanc / encre, choisir le meilleur, et refuser si aucun n'atteint 4,5. Implémentée dans `src/core/contrast.ts` (`pickTextColor`).

---

## 6. Contraintes légales (point bloquant)

- **Ne jamais reproduire** les logos, lettrages ou illustrations officiels.
- Évocation **originale** seulement. Ex. Love Letter : police calligraphique libre (Great Vibes) + sceau de cire **redessiné**.
- Les noms de jeux sont cités à titre descriptif. **Droits à vérifier avant publication** (marques, règles, stores).
- Vérifier la licence de chaque police et de chaque asset.
- Ajouter une mention dans l'app : « Application non officielle, sans lien avec les éditeurs des jeux cités. »
- **Stores** : un éditeur peut demander le retrait d'une app qui cite sa marque, et les stores l'exécutent sans délai. Sur le web, ce risque existe mais personne ne peut bloquer la publication à votre place. C'est une raison de lancer d'abord la PWA.
- **Apple** : l'App Store refuse les apps qui ne sont « qu'un site web dans une coque » (règle 4.2, fonctionnalité minimale). Une app Capacitor passe si elle apporte un vrai usage mobile : contenu embarqué, hors ligne, interface pensée pour le tactile, quelques fonctions natives (écran maintenu allumé pendant la lecture, partage). À traiter au jalon 6.

---

## 7. Écrans

Les écrans sont ceux des **maquettes** : `maquettes/trio/*.png` (sources HTML dans `maquettes/trio/source/`) et `maquettes/love-letter/*.png` (extraites de la galerie `love-letter-maquettes.html`). L'app est **comparée pixel à pixel** à chacune par `e2e/maquettes.spec.ts`. Quand la galerie de Love Letter et les maquettes de Trio (plus abouties) divergent sur une mise en page commune, **celle de Trio fait foi** (écarts en 7.10).

### 7.0 Parcours et principes
Accueil → le jeu → **Jouer** : Tes cartes (liste) → *[détail d'un groupe : vue à balayer]* → Mise en place → Un tour de jeu → Qui joue ? → Partie en cours ⇄ saisie des scores → **Podium** (partie terminée ou interrompue) → Historique.
Le jeu → **Règles complètes**. **Jouer** ouvre toujours « Tes cartes », pour tous les jeux et à chaque fois : le chemin ne dépend pas de l'historique du joueur.
Trois écrans racines ont la **barre d'onglets** Jeux / Scores / Réglages : l'accueil, l'historique, les réglages.

- **Le mode se choisit après le jeu**, avec la bascule de « Tes cartes ».
- **Chaque écran tient sans défilement vertical** : vérifié sur tous les écrans, à 390 × 844 et à 393 × 852, au plus petit et au plus grand nombre de joueurs de chaque jeu. **Au-delà de 6 joueurs** (Loup-garou : jusqu'à 12), « Qui joue ? », la partie, la saisie des scores et le podium passent en **mise en page compacte** : prénoms et compteurs sur deux colonnes, quatre petits jetons par ligne, blocs serrés (`isCrowded`, `src/state/session.ts`). Jusqu'à 6 joueurs, rien ne change. Seules la liste des cartes et la carte des règles complètes défilent **dans leur cadre** quand un jeu a beaucoup de groupes ou de règles (Love Letter : 10 groupes, 7 sections) : la page, elle, ne bouge pas. **Exception : « Un tour »**, dont la table est celle de la mise en place à l'identique : la page défile au besoin (choix de l'utilisateur).
- Format des maquettes : 390 × 844, marges 48 / 24 / 24, blocs espacés de 16.

### 7.1 Accueil « Tes jeux » (maquette *Games* de Love Letter)
Titre, **recherche** (« Un jeu, un titre… », filtre sur le nom, sans casse ni accents), **filtres** en pastilles, sur une seule ligne qui défile au doigt jusqu'aux bords de l'écran (Tous ; « 2 joueurs » : se joue à deux ; « Rapide » : 15 minutes ou moins ; « Sans joker » : le paquet de 52 seul, aucun joker gardé), liste des jeux (carré aux couleurs du jeu avec son initiale, nom, « 2–6 joueurs · 20 min »), barre d'onglets. Mot de bienvenue au premier lancement. Aucun choix de mode ici. La liste défile dans son cadre, sans barre, s'il y a beaucoup de jeux.

### 7.2 Le jeu (maquette *GameDetail*)
Bandeau plein cadre aux couleurs du jeu (« ‹ Retour », nom en grand, « 3–6 joueurs · 15 min »), carte blanche (phrase d'accroche en gras + texte), boutons **Jouer** et **Règles complètes**.

### 7.3 Tes cartes : vue liste (maquettes *List classic* et *List expert*)
En-tête (voir « Navigation » ci-dessous). Titre, **bascule Classique / Connaisseur**, puis une ligne par **groupe de cartes** (6 pour Trio : A, 2 à 6, 7, 8 à 10, Valet, Dame) : mini-carte (ou **main**, voir ci-dessous), titre et nombre de cartes (« 2 à 6 · 15 cartes »), valeur (« Valent 2 à 6. »), pastille éventuelle (« Spécial »). En bas, le bandeau jaune **dérivé des données** (« Retire les carreaux et les rois. Garde 36 cartes. »). La liste défile au doigt dans son cadre, **sans barre de défilement** (app mobile) ; le bandeau et le bouton « Suivant » restent fixes en dessous.
- **La main.** Un groupe de **plusieurs rangs** (Trio : « 2 à 6 », « 8 à 10 » ; Love Letter : « Valets et rois noirs ») se montre en **main** : 2 ou 3 cartes de face en éventail, inclinées, qui se recouvrent (le rang de chacune reste lisible). Elle se déduit des cartes du groupe, sans champ de configuration : une carte par rang ; au-delà de 3 rangs, la première, celle du milieu et la dernière (« 2 à 6 » → 2-4-6 ; « 8 à 10 » → 8-9-10). Un groupe d'un seul rang (l'As, le 7, le Valet, la Dame) ou de jokers reste **une carte seule**. Code : `src/data/hand.ts` (`handOf`, `pickHand`), composant `CardHand`.
- **Deux lignes par groupe, sans retour à la ligne** (le texte qui dépasse se coupe par « … »). Ligne 1 : ce qui identifie les cartes + leur nombre ; ligne 2, dans tous les cas : la valeur ou le pouvoir (`short`, une trentaine de caractères au plus).
- **Classique** : la liste. Ligne 1 : les cartes à garder + le nombre (« 2 à 6 · 15 cartes », « Valets et rois noirs · 6 cartes ») ; ligne 2 : « Valent 2 à 6. », « Devine la carte d’un rival. ».
- **Connaisseur** : la même liste, sans légende, **carte d'origine** (une **image** découpée d'une planche, ou dessinée : valeur sur sa couleur ; pour un groupe de plusieurs cartes, une main de 2 ou 3 cartes d'origine, choisies comme ci-dessus) → carte ou main du paquet. Ligne 1 : la **carte du jeu d'origine** + le nombre de cartes (« 2–6 · 15 cartes », « Garde · 6 cartes ») ; la correspondance se lit sur les deux mains et la flèche, elle n'est plus écrite « 2–6 → 2 à 6 ». Ligne 2 : la même qu'en Classique. Un jeu sans `expert.cards` garde la carte en pointillés.

### 7.4 Vue à balayer (maquette *Swipe*)
Un clic sur une ligne ouvre cette vue sur le groupe touché. « Groupe 3 / 6 », grande carte (200 × 280, cadre soleil) ; pour un groupe de plusieurs rangs, la **main** de 2 ou 3 grandes cartes en éventail (même hauteur de scène : le texte dessous ne bouge pas), flèches ‹ ›, points de progression, carte d'explication (« ×3 · Le 7 est spécial. » + texte), bouton « Suivant ». On balaie, on touche les flèches ou le bouton, ou on utilise le clavier. Mode connaisseur : la ou les cartes d'origine dessinées (3 rem de large, nom en légende) à côté (ou, si elles sont cinq, au-dessus) d'une ligne grise qui donne le pouvoir d'origine. Après le dernier groupe : « Terminer » ramène à la liste.

### 7.5 Mise en place et un tour de jeu (maquettes *Setup* et *TurnFlow*)
Mise en place : la **table vue de haut** (`CardTable`) : quatre mains de **cartes de dos** à la couleur de dos du jeu (en face, à gauche et à droite tournées vers le centre, et la tienne en bas, seule légendée), et au centre ce que le jeu y pose (1 à 3 éléments, des dos ou une carte visible). Les cartes **mises de côté** (`aside: true` : « Cartes de côté » du Tarot africain, « Cartes en trop » du Loup-garou) vont dans le **coin en bas à droite**, à côté de ta main, pas au centre ; l'« Écartée, cachée » de Love Letter reste au centre (demande de l'utilisateur). **Jeux de plis** (Tarot africain) : « Un tour » pose le **pli au milieu**, cartes **superposées en croix**, chacune décalée vers son joueur (`trick` : en face et à droite ont joué, 3 cartes en main) ; ta main de 3 et ta carte prête à jouer, dans ta main mais qui en dépasse (`next`) ; le joueur de gauche n'a pas encore joué (4 cartes). Trio : mains en éventail, « Ta main, triée » ; « Au centre, cachées » en cartes alignées (3 x 2). Love Letter : une carte par main, « Ta main » ; « Pioche » en pile et « Écartée, cachée ». Les quatre mains sont **à la même distance** des cartes du centre, quelle que soit la légende (un reflet invisible de la légende au-dessus des cartes répond à la vraie légende en dessous). Puis les étapes numérotées. Un tour de jeu : **la table de la mise en place, à l'identique** (mêmes dimensions, mêmes positions, mêmes légendes), avec **quelques cartes retournées** (`turn.reveal`) : Trio, un 4 au centre et un as au bord de la main d'en face ; Love Letter, ta main de 2 cartes de face (un 5 et la dame de cœur) et une carte découverte à côté de la main du joueur d'en face et de celui de droite, posée hors du flux pour que rien ne bouge. Puis 4 étapes resserrées, la façon de gagner (« Gagner » ou « Gagner la manche »), bouton « Jouer ».

### 7.5 bis Compter les points (facultatif, sans maquette)
Pour un jeu dont les cartes rapportent des points différents (`points` dans le `game.yaml`). Le même écran pour tous les jeux : titre « Compter les points », une phrase (`intro`), la **bascule Classique / Connaisseur** (la même que « Tes cartes », réglage partagé), puis **une ligne par valeur**, avec les **lignes de « Tes cartes »** (`CardRow`) : la main ou la carte seule, le titre et le nombre de cartes, une ligne grise, et la valeur en pastille à la couleur du jeu à la place du chevron (« 7 points »). Mode connaisseur : la carte d'origine dessinée (`expert_card`), une flèche, puis la main du paquet ; le titre donne la valeur d'origine (« 7 têtes »). 6 qui prend : les cartes 1, 5, 20, 77 et 55 (1, 2, 3, 5 et 7 têtes) aux couleurs d'origine, une tête de taureau en grand (`figure`, silhouette fournie par l'utilisateur, recolorée par `figure_color`) et le numéro par-dessus (`value_color`). Il vient **après « Un tour »** (« Un tour » dit alors « Suivant » ; « Compter les points » dit « Jouer ») ; pendant la partie, un lien « Compter les points » l'ouvre depuis la **saisie des scores** (`?depuis=scores`, « Retour aux scores »). Chaque carte gardée a une valeur, une seule (test). « Tes cartes », lui, ne parle que de l'ordre ou du rôle des cartes. 6 qui prend : « Tes cartes » montre l'ordre de force (une ligne par couleur, puis les jokers) ; « Compter les points » : dame de pique 7, rois 5, 10 3, 5 2, toutes les autres (jokers compris) 1.

### 7.6 Règles complètes (maquette *FullRules*)
Une carte blanche avec toutes les sections : But, Mise en place, Un tour, Trio, Cartes différentes, Mode piquant.

### 7.7 Partie en cours et saisie des scores (maquettes *Play* et *ScoreEntry*)
Écrans et fonctionnement **identiques pour tous les jeux** ; seuls les mots viennent de la configuration (`scoring`). Fond du tapis du jeu (`main_color`) ; en haut à droite, `party_label` (« Trios gagnés », « Manche 3 ») ; jetons des joueurs (cercle à bord pointillé, score, nom) ; tuiles Règles / Mise en place / Cartes / Un tour (elles ouvrent ces écrans, avec retour à la partie) ; une **pioche de dos** (couleur de dos du jeu) dans la zone libre, décorative, qui disparaît s'il n'y a pas la place (six joueurs) ; « Noter les scores » ; « Terminer la partie » (archive la partie comme **interrompue**, l'efface, ouvre le podium).
- Saisie : un compteur − / + par joueur, qui **part de zéro** (points gagnés depuis la saisie précédente) ; « Valider » (`validate`) les ajoute aux scores et passe à la manche suivante. Titre et question viennent du jeu (« Trios gagnés » / « Qui a gagné un trio ? » ; « Fin de la manche 3 » / « Qui a gagné des points ? »).
- Si un joueur atteint le score visé (`target` : 3 trios pour Trio ; 6, 5, 4, 3 ou 3 points à 2, 3, 4, 5 ou 6 joueurs pour Love Letter), la partie est **terminée** : podium. Trio : le trio de 7 (victoire immédiate) se note en ajoutant 3 au gagnant.
- *Ajout (absent des maquettes)* : **Qui joue ?**, le nombre de joueurs (dans les limites du jeu) et leurs prénoms. « C'est parti » en bas ; « Passer cette étape » en haut à droite démarre sans prénoms. **Partie sans prénoms** (pastille, ou « C'est parti » avec tous les champs vides) : la partie en cours n'affiche **pas les jetons** des joueurs ; « Noter les scores » ouvre « Qui joue ? » (`?depuis=partie`, texte « Pour noter les scores, écris le prénom de chaque joueur. », champs vides, nombre de joueurs gardé, « Retour » vers la partie, pas de « Passer cette étape ») puis, dès qu'un prénom est donné, la saisie des scores. La saisie des scores ne s'ouvre jamais sur une partie sans prénoms.

### 7.7 bis Podium, historique, réglages (maquettes *Results*, *History*, *Settings* de Love Letter)
- **Podium** : pastille « Partie terminée » (verte) ou « Partie interrompue » (jaune), puis **tous les joueurs en liste**, du premier au dernier, avec leur score : 🥇 🥈 🥉 pour les trois premiers, « 4e », « 5e »… ensuite ; « Voir l'historique », « Retour aux jeux ». Les égalités partagent le même rang. La partie est lue dans l'historique.
- **Tes scores** : parties passées par jeu (date, deux meilleurs scores, « Terminée » / « Interrompue »). Un jeu est ouvert à la fois, le plus récemment joué au départ ; les autres montrent « 1 partie › ». Les 100 dernières parties sont gardées.
- **Réglages** : langue (Français ; English et Español grisés, avec « arrivent bientôt »), lien « À propos ». Ni compte ni déconnexion.

### 7.8 Mentions / À propos
Crédits, licences des polices, avertissement légal, version.

### 7.9 États à prévoir
Premier lancement, liste vide, jeu / groupe / page introuvable (avec retour), partie absente (on demande qui joue), donnée mémorisée abîmée (traitée comme « pas de partie »).

### 7.9 bis Navigation (la même dans toute l'app)

- **En haut à gauche** : « ‹ Retour », toujours ce libellé, jamais le nom d'un écran (composant `StepHeader`, ou le bandeau du jeu).
- **Écrans racines** (Jeux, Scores, Réglages) : la barre d'onglets du bas tient lieu de navigation ; pas de « Retour ».
- **En haut à droite** : une seule pastille, au même endroit. « Quitter le tutoriel » sur les écrans du tutoriel (Tes cartes, vue à balayer, Mise en place, Un tour), absente quand l'écran est ouvert depuis la partie. « Passer cette étape » sur « Qui joue ? » : elle démarre la partie tout de suite, avec les noms par défaut (« Joueur 1 »…) et le nombre de joueurs affiché ; les prénoms tapés sont ignorés.
- **En bas de page** : le bouton principal de l'étape, toujours à la même place : « Suivant » (Tes cartes, vue à balayer, Mise en place), « Jouer » à la dernière étape du tutoriel. Depuis la partie : « Retour à la partie ».
- Les libellés de l'en-tête ne sont pas personnalisables : `StepHeader` n'accepte que des adresses (`backTo`, `quitTo`) ou l'action de « Passer cette étape » (`onSkip`).

### 7.10 Écarts assumés avec les maquettes
| Écart | Raison |
|---|---|
| Navigation homogène (voir ci-dessous) ; sur « Tes cartes » : bandeau « Retire… » en bas, bouton « Suivant » en bas, pas de légende en connaisseur, liste sans barre de défilement | Demandé par l'utilisateur après la reprise des maquettes. Les sources `maquettes/trio/source/01`, `02`, `03`, `04`, `07` et `08` ont été modifiées de même (libellés de retour, pastille, bouton), pour que le test de fidélité reste la référence. |
| **Main** de cartes dans la liste (« 2 à 6 », « 8 à 10 », « Valets et rois noirs ») et, en Connaisseur, main des cartes d'origine ; vue à balayer d'un groupe de plusieurs rangs | Demande de l'utilisateur. Les lignes grandissent et le titre passe parfois à la ligne : le test ignore le cadre de la liste (`HAND_LIST` dans `e2e/maquettes.spec.ts`). La vue à balayer des maquettes montre le 7, une carte seule : inchangée. |
| Lignes de la liste sur **deux lignes** : « 2 à 6 », « 15 cartes » puis « Valent 2 à 6. » ; en Connaisseur « 2–6 », « 15 cartes » (plus de « 2–6 → 2 à 6 ») | Demande de l'utilisateur : trop de texte sur mobile. Le cadre de la liste est déjà ignoré par le test des maquettes (`HAND_LIST`). |
| **Love Letter** : « Gagner la manche » (un tour) et les textes de l'Espionne | Règle corrigée par l'utilisateur : 1 point en fin de manche si on est en vie et **seul** à avoir un joker devant soi (la galerie disait « le plus de jokers »). La maquette 09 reprend ce texte. |
| Écran « Qui joue ? » | Les maquettes montrent la partie (Léa, Tom, Inès) mais pas sa création. |
| **6 qui prend !** : tuile de l'accueil rouge avec le logo taureau, au lieu du violet et du « 6 » ; nom « 6 qui prend ! », le 6 en bleu sur le bandeau (la tuile garde le nom tel quel) | Couleurs de la boîte, demandées par l'utilisateur. Sur le bandeau rouge, le « 6 » bleu se lit mal (contraste d'environ 1,9) : écart assumé. Maquette d'accueil 02 refaite. |
| **6 qui prend**, cartes d'origine (Connaisseur) : chiffres aux couleurs d'origine, sous 4,5 de contraste pour certains (lavande sur blanc, turquoise sur bleu clair, jaune sur vert clair, vert clair sur rouge) | Couleurs fournies par l'utilisateur, fidèles aux cartes d'origine. Le chiffre est décoratif (la ligne dit « 7 têtes ») et porte un fin contour encre. Le fond de chaque carte, lui, respecte le contraste. |
| Podium : une liste de tous les joueurs, médailles 🥇 🥈 🥉 aux trois premiers, au lieu des marches | Demande de l'utilisateur. Maquettes Love Letter 12 et 13 refaites. |
| Plus de 6 joueurs (Loup-garou) : « Qui joue ? », partie, saisie des scores et podium compacts (deux colonnes, petits jetons) | Les maquettes ne vont pas au-delà de 6 joueurs ; il faut tenir sans défilement jusqu'à 12. Les écrans à 6 joueurs ou moins sont inchangés. Maquette d'accueil 02 : tuile « Loup-garou » ajoutée. |
| **Love Letter** : 21 cartes, règle de l'édition 2019 (10 personnages de 0 à 9, 2 à 6 joueurs), au lieu des 16 de la galerie | Règles données par l'utilisateur (nos-jeux-de-societe.fr). Les jokers sont les Espionnes, la dame de cœur est la Princesse, les 6 Gardes sont 4 valets et 2 rois noirs, valeur = rang pour 2 à 8 ; « Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet. » |
| **Love Letter** : lignes de liste au format de Trio (« Valets et rois noirs » / « 6 cartes » / « Devine… ») ; vue à balayer, mise en place sans la ligne vide, sources reconstruites d'après Trio | La galerie est une version antérieure : la mise en page validée de Trio prime. En mode connaisseur la ligne dit le nom d'origine (« Garde »). |
| **Love Letter** : textes « Fin de manche » et « Cas particuliers » | La galerie contient des `[…]` : textes rédigés d'après la règle (1 point par manche, jokers, égalités, 6 / 5 / 4 / 3 / 3 points), à relire. Les textes de détail des groupes aussi. Les maquettes 02, 03, 04, 05, 06, 07, 08, 09 ont été refaites pour la nouvelle règle. |
| **Love Letter** : tapis bordeaux #812B2B, ombre brun #400E0E, texte crème #EEDDC8 et logo en sceau de cire, au lieu du rouge de la charte et de la lettre « L » | Palette fournie par l'utilisateur. Le rose #DFB6B6 et le corail #E57979 ne servent qu'au logo (1,8 et 2,9 de contraste sur blanc). Maquettes 02, 03 et 10 refaites. |
| **Love Letter** : mise en place sans les 3 cartes visibles à 2 joueurs | Le mode particulier à 2 joueurs est abandonné (demande de l'utilisateur) : schéma à deux éléments, quatre étapes, pas de « Cas particuliers ». Maquettes 04 et 08 refaites. |
| **Love Letter** : fond **crème** sur tous les écrans du jeu (au lieu du bleu), pastilles et bascules bordeaux, texte encre, relief « tan » des surfaces blanches, dos corail | Nouveau principe `background_color` (demande de l'utilisateur) : l'écran du jeu prend la palette. Maquettes 03 à 09 et 11 à 13 refaites ; 02, 14 et 15 (hors du jeu) gardent le bleu. |
| Mise en place : la table à quatre mains, le centre au milieu, au lieu de deux éléments côte à côte | Demande de l'utilisateur : montrer la table entière (les mains des joueurs et ce qui se pose au centre). Les mains sont en éventail incliné, comme celles de « Tes cartes » ; le centre de Trio est en cartes alignées ; les quatre mains sont à la même distance du centre. « Un tour » montre **la même table** (mêmes dimensions, mêmes positions, mêmes légendes) avec quelques cartes retournées ; la page peut alors défiler (choix de l'utilisateur). Ses étapes sont resserrées. Maquettes de Trio 05 et 06 et de Love Letter 08 et 09 refaites. |
| Dos de carte : pile, éventail ou carte seule à la couleur de dos du jeu, au lieu de la carte pleine bleu nuit | Nouveau principe « dos de carte » (`card_back_color`, `layout`). Maquettes de Trio 05 (mise en place) et Love Letter 08 refaites ; **Trio 06 et Love Letter 09** gagnent un schéma sous le titre ; **Trio 08 et Love Letter 10** une pioche de dos. Les maquettes de Trio, validées, ont été modifiées à la demande de l'utilisateur. |
| Mode Connaisseur : cartes d'origine au lieu de la carte en pointillés ; vue à balayer : rangée des cartes d'origine | Demande de l'utilisateur. **Trio : 12 images découpées de la planche fournie** (`npm run planche`, `src/content/games/trio/carte-NN.webp`) ; l'utilisateur les dit être des dessins qui lui appartiennent (la règle du projet interdit les illustrations officielles : à lui d'en répondre). **Love Letter : dessinées en code** (valeur sur couleur relevée sur la planche, sans portrait ni texte officiel). Maquettes Trio 03 et 04, Love Letter 06 et 07 refaites. Trois couleurs de Trio (4, 8, 9) légèrement assombries pour la valeur blanche des cartes dessinées. |
| Réglages : pas de bloc Compte ni « Se déconnecter » ; pas de bloc « Tutoriels passés » ; note « English et Español arrivent bientôt » ; « À propos » à la place | Pas de compte en v1. « Jouer » suit le même chemin pour tous les jeux, à chaque fois : il n'y a donc rien à réactiver. Les sources de la maquette 15 sont retouchées de même. |
| Réglages : bouton « Nouveautés » au-dessus de « À propos » | Popup des nouveautés (§10.6), demandée par l'utilisateur. Source de la maquette 15 retouchée de même. Le bouton n'apparaît que s'il existe au moins une note publiée. |
| Accueil : la troisième vignette « [JEU 3] » de la maquette devient **6 qui prend**, en tête (ordre alphabétique) | Nouveau jeu. Maquette 02 de Love Letter refaite (6 qui prend, Love Letter, Trio), plus de masque dans le test. |
| Podium : l'écran n'a pas de « ‹ Retour » | Fidèle à la maquette : on en sort par « Voir l'historique » ou « Retour aux jeux ». |
| « Terminer la partie » de **Trio** mène aussi au podium (partie interrompue) et à l'historique | Cohérence des jeux ; la maquette de Trio n'a pas ce cas. |
| Texte du « Mode piquant » | La maquette contient « [Deux trios liés. À détailler.] » : remplacé par un texte publiable. |
| « − » grisé quand un score est à 0 | On ne descend pas sous zéro ; la maquette montre le bouton actif. |
| Cœurs à la place des symboles provisoires | Les mini-cartes de la maquette sont toutes des cœurs ; l'app montre les vrais symboles, avec la même alternance rouge / noir. |
| Chiffre des jetons joueurs | Couleur choisie selon la charte (`text_on`, contraste ≥ 4,5) : encre sur jaune et bleu clair, là où la maquette met du blanc. |
| Zones tactiles de 44 px | Les liens « ‹ Retour » ont une zone tactile qui déborde du texte, sans changer la mise en page. |
| Rang à 14 px sur les mini-cartes | Valeur de la maquette (la charte dit 16 px minimum) ; la mini-carte est décorative, le texte de la ligne porte l'information. |

---

## 8. Composants UI réutilisables

Composants React dans `src/components/`, un dossier par composant (TSX + CSS Module + test).

- **Structure** : `Screen` (fond, marges des maquettes, zones sûres ; options `solid`, `bare`, `fixed`, `tight`), `StepHeader` (« ‹ Retour » + pastille « Quitter le tutoriel » ou « Passer cette étape »), `PillLink`, `PillButton`, `PageTitle`, `Panel` (carte blanche), `Notice` (bandeau jaune), `EmptyState`.
- **Boutons** : `Button` et `ButtonLink` (variantes soleil, cerise, ciel, **blanc** ; option `block` pleine largeur).
- **Cartes et jetons** : `PlayingCard` (variantes `standard`, `list`, `focus` ; lettres V / D / R ; face « joker » : une étoile sans rang), `GhostCard` (carte d'origine en pointillés, sans `expert.cards`), `PokerChip`, `PlayerChip`.
- **Choix** : `Segmented` (bascule à segments : mode de lecture, langue), `ModeToggle` (bascule Classique / Connaisseur), `Chips` (pastilles de filtre), `TabBar` (onglets Jeux / Scores / Réglages), `CardGroupRow` (ligne de la liste).
- **Jeu** : `GameBand` (bandeau), `GameTile` (vignette d'accueil, avec le logo ou l'initiale), `CardTable` (la table vue de haut, mise en place et un tour : quatre mains, le centre, ce qui est posé devant toi), `CardPile` (cartes de dos : une carte, une pile, un éventail, une grille ; une carte retournée), `CardHand` (la main : 2 ou 3 cartes de face en éventail), `OriginalCard` / `OriginalCards` (carte du jeu d'origine : image, ou dessin), `GameScope` (`src/features/game-scope/` : couleurs du jeu sur toutes ses pages).
- **Partie** : `ResourceTile` (tuiles de raccourci), `ScoreStepper` (compteur − / +).

Hook `useSwipe` (`src/core/`) : balayage tactile et flèches du clavier. Les symboles ♠ ♥ ♦ ♣ sont dessinés en **vectoriel** (`PlayingCard/symbols.ts`), pas en texte.

---

## 9. Données et contenu

### 9.1 Principe
**Tous les jeux ont les mêmes écrans et le même fonctionnement.** Un jeu n'est qu'une **configuration** : un dossier `src/content/games/<id>/` avec un `game.yaml` et, si besoin, un logo (`svg` ou `png`) et la police de son nom (`woff2`, licence libre). Ajouter un jeu = ajouter ce dossier, **sans toucher au code**, sauf demande de nouvelle fonction. Modèle commenté à copier : `docs/modele-jeu.yaml`.

Les fichiers sont lus au build (`import.meta.glob`, plugin `masterscards-yaml` de `vite.config.ts`) : ils sont donc **embarqués** et précachés pour le hors ligne. `src/data/loadGame.ts` prépare chaque jeu (cartes exactes, nombre de cartes, `{cards}` dans les textes, police). C'est vérifié : le modèle, déposé tel quel comme troisième jeu, passe le schéma, le parcours complet jusqu'au podium (`e2e/jeux.spec.ts`) et le test « aucun défilement » (`e2e/visual.spec.ts`), qui parcourent **tous** les dossiers de jeux.

### 9.2 Modèle

Source de vérité : `src/content/game.schema.json` (VS Code complète les champs avec l'extension YAML ; types TypeScript dans `src/data/types.ts` : `GameConfig` pour le fichier, `Game` pour le jeu prêt à l'emploi).

```yaml
id: love-letter
name: Love Letter
font: { file: great-vibes.woff2, family: Great Vibes, weight: 400, band_size: 4 }
main_color: '#812B2B' # bordeaux
shadow_color: '#400E0E' # brun
text_color: '#EEDDC8' # crème
background_color: '#EEDDC8' # fond des écrans du jeu
card_back_color: '#E57979' # corail
logo: logo.svg # sceau de cire
tagline: Une lettre. Une princesse. Un seul gagnant.
description: …
players: { min: 2, max: 6 }
duration_min: 20
group_word: Carte
classic_forbidden_terms: [Espionne, Garde, Prêtre, Baron, Servante, Chancelier, Comtesse]
card_groups:
  - label: Jokers
    jokers: 2
    display: { joker: true }
    short: Peut remporter 1 point.
    detail:
      title: …
      text: …
    expert:
      original: '0'
      name: Espionne
  - label: Valets et rois noirs
    cards:
      - ranks: [J]
        suits: all
      - ranks: [K]
        suits: [spades, clubs]
    display: { rank: J, suit: hearts }
    short: Devine la carte d’un rival.
    detail:
      title: …
      text: …
    expert:
      original: '1'
      name: Garde
      power: deviner la carte d’un joueur pour l’éliminer
      cards: [{ value: '1', name: Garde, color: '#E0271D' }] # la carte d'origine, dessinée
scoring:
  unit: point
  party_label: Manche {round}
  title: Fin de la manche {round}
  question: Qui a gagné des points ?
  validate: Valider la manche
  target: { 2: 6, 3: 5, 4: 4, 5: 3, 6: 3 }
tutorial:
  setup: { title: …, hand: { label: Ta main, layout: spread }, center: [{ label: Pioche, layout: pile }], steps: [Mélange les {cards} cartes.] }
  turn: { title: …, reveal: { hand: [{ rank: 5, suit: hearts }, { rank: Q, suit: hearts }], played: { across: { rank: 3, suit: spades } } }, steps: […], win: { title: …, text: … } }
full_rules: [{ title: But, text: … }]
```

| Champ | Règle |
|---|---|
| `id` | Identifiant d'URL. Doit être égal au nom du dossier. |
| `font` | Absent : Fredoka 700. Sinon `file` (woff2 du dossier du jeu), `family`, `weight` (défaut 400), `band_size` (taille du nom dans le bandeau, défaut 3,5 × 16 px). La police est déclarée au démarrage (`registerGameFonts`) et précachée. |
| `main_color` | `jaune`, `vert`, `rouge`, `bleu` ou `#RRGGBB`. Le texte est **choisi automatiquement** ; une couleur sans contraste ≥ 4,5 est refusée. L'ombre vient de `tapis_ombres` (charte) ou, pour une couleur libre, de la couleur assombrie. |
| `shadow_color`, `text_color` | Facultatifs, `#RRGGBB`. Remplacent l'ombre calculée et le texte choisi seul. Un `text_color` sous 4,5 de contraste avec le tapis est refusé. Le texte colore le bandeau, la vignette (initiale), l'écran de partie. |
| `background_color`, `background_text_color` | Facultatifs. Remplacent le bleu de l'app sur **tous les écrans du jeu** (`/jeu/:id/…`) : `GameScope` pose sur `<html>` les variables `--game-screen-*` (dégradé tiré du fond : un peu plus clair en haut, plus foncé en bas), `--game-edge` (relief des surfaces blanches) et, pour les pastilles, bascules et boutons discrets, `--game-pill-bg/fg` (= `main_color` et son texte). Les feuilles de style les lisent avec le jeton de la charte en repli : accueil, historique et réglages restent bleus. Sans `background_color`, le jeu garde le bleu et ses pastilles bleu nuit. Texte lisible (≥ 4,5) sur tout le dégradé, sinon refusé. |
| `card_back_color` | Facultatif (défaut : `main_color`). Couleur du dos des cartes, posée en `--game-card-back` ; rayures de la charte. |
| `card_groups` | Une ligne de la liste = une page de la vue à balayer. `cards` : les cartes à garder, une liste de `{ ranks, suits }` (`suits: all` = les quatre couleurs ; les rangs 2 à 10 s'écrivent sans guillemets). Le nombre de cartes est **calculé**. `display` : la carte montrée (défaut : la première) ; `short` : ligne 2 de la liste (la valeur ou le pouvoir, une trentaine de caractères au plus) ; `badge` : pastille facultative ; `detail` : carte d'explication de la vue à balayer ; `expert` : la **correspondance** avec le jeu d'origine : `original` (« 2–6 », « 1 »), `name` (« Prêtre » ; ligne 1 du mode Connaisseur, à la place de `original`), `power` (son pouvoir, en une proposition). |
| `expert.cards` | Facultatif, 1 à 5 par groupe : les cartes du jeu d'origine en mode Connaisseur : `{ value, name?, color, image? }`. Avec `image` (svg, png ou webp du dossier du jeu, droits à la charge du jeu), la carte **est** l'image, chiffre compris ; `npm run planche` découpe une planche en images à fond transparent (`scripts/decouper-planche.ts`, qui repère les cartes seul). Sans `image`, elle est dessinée : valeur en blanc ou encre selon le contraste de `color` (≥ 4,5, vérifié par test), sans portrait ni texte officiel. Sans `cards`, la carte en pointillés. |
| `layout` (éléments de schéma) | `single` (une carte, défaut), `pile` (la pioche : trois dos décalés), `spread` (une main : trois dos en éventail incliné, comme les mains de « Tes cartes »), `grid` (des cartes posées alignées, 3 x 2), pour les cartes de dos ; `card` pour une carte visible. Une carte retournée (`turn.reveal`) prend la place d'un dos : au bord d'une main, au milieu de la rangée du bas d'une grille, sur le dessus d'une pile. |
| `tutorial.turn.reveal` | Facultatif. « Un tour » montre la table de la mise en place, à l'identique, avec ces cartes de face : `hand` (ta main pendant le tour, 1 à 3 cartes de face, en éventail), `across` (la carte du bord de la main d'en face, retournée), `center` (une carte par élément du centre, dans l'ordre, retournée parmi ses dos), `played` (`across`, `left`, `right` : la carte découverte posée à côté de la main d'un autre joueur). |
| `group_word` | « Groupe » (défaut) ou « Carte » : « Carte 2 / 8 » dans la vue à balayer. |
| `scoring` | Les mots du jeu et la règle de fin (le fonctionnement est commun, voir §7) : `unit` (« trio », « point », pour les boutons − et +), `party_label` (en haut à droite de la partie : « Manche {round} », « Trios gagnés »), `title`, `question`, `validate`, `target` (score qui termine la partie : un nombre, ou un nombre par effectif ; absent : pas de fin automatique). |
| `tutorial.setup.hand`, `tutorial.setup.center` | La table de la mise en place, vue de haut : quatre mains de dos (en face, à gauche, à droite, et la tienne en bas) autour du centre. `hand` : ta main `{ label, layout }` (`single` ou `spread`), légendée ; les trois autres mains prennent sa disposition, sans légende. `center` : 1 à 3 éléments `{ label, layout?, card? }` posés au milieu (pioche, cartes à disposer, carte écartée…). |
| `{cards}` | Dans tous les textes : remplacé par le nombre de cartes gardées. `{round}` : numéro de manche (scores). |
| bandeau « Retire… Garde… » | **Dérivé** des cartes gardées, carte par carte (`deckPlan` dans `src/data/deck.ts`). Si les cartes gardées sont exactement toutes les couleurs gardées dans tous les rangs gardés, et qu'il y a au plus 3 éléments à retirer : « Retire les carreaux et les rois. Garde 36 cartes. » Sinon, ou s'il y a des jokers : « Garde ces 21 cartes, dont 2 jokers. Retire tout le reste du paquet. » Rien à écrire. |
| `classic_forbidden_terms` | Facultatif. Vocabulaire d'origine interdit dans les textes (test). Absent pour Trio. |
| pioche | Pas de champ : le dos prend la couleur du jeu. |

Un test automatisé (`src/data/games.test.ts`, Vitest + Ajv) vérifie **chaque jeu**, et le modèle `docs/modele-jeu.yaml` :
- conformité au schéma, un `game.yaml` par dossier, id égal au dossier, logo et police existants ;
- groupes : aucune carte gardée deux fois, noms différents, carte montrée dans le groupe, tient dans 52 cartes (jokers en plus, 2 au plus), chaque groupe a son `expert.original` ;
- `{cards}` remplacé partout ; score visé donné pour chaque effectif quand c'est une table ;
- contraste texte / fond ≥ 4,5 ;
- vocabulaire interdit par le jeu absent des textes ;
- **ton** : tutoiement, phrases de 22 mots au plus.

### 9.3 Jeux livrés en v1
1. **Trio** *(réalisé, d'après les maquettes)*. Fin automatique au 3e trio. 36 cartes d'origine (valeurs 1 à 12 en trois exemplaires) jouées avec le paquet de 52 : on garde pique, cœur et trèfle de l'As à la Dame, et on **retire les carreaux et les rois**. As = 1, Valet = 11, Dame = 12. Six groupes : A, 2 à 6, 7 (« Spécial »), 8 à 10, Valet, Dame. 3 à 6 joueurs, environ 15 minutes. Le mode « Piquant » n'est pas jouable : ses liens entre numéros sont imprimés sur les cartes d'origine.
2. **Love Letter** *(réalisé, règle de l'édition 2019)*. 2 à 6 joueurs, 20 minutes, nom en Great Vibes, palette bordeaux (tapis #812B2B, ombre #400E0E, texte crème #EEDDC8) et un sceau de cire original (corail, rose, crème) en logo. **21 cartes**, valeur = rang : Espionne 0 = les 2 **jokers** (rien ne se passe quand on la joue ; 1 point en fin de manche si l'on est en vie et **seul** à en avoir une devant soi) ; Garde 1 = 4 valets et 2 rois noirs (×6) ; Prêtre 2, Baron 3, Servante 4, Prince 5, Chancelier 6 (×2 chacun, cœur et pique) ; Roi 7 = 7♥ ; Comtesse 8 = 8♠ ; Princesse 9 = la **dame de cœur**. Dix groupes. Tout le reste du paquet est retiré. Une manche rapporte 1 point (2 au plus avec les jokers) ; le premier à 6, 5, 4, 3 ou 3 points gagne à 2, 3, 4, 5 ou 6 joueurs.

3. **6 qui prend !** *(réalisé, version MastersCards)*. Nom en Grenze Gotisch Black (OFL), le « 6 » en bleu cerné de blanc (`name_accent`), le reste cerné de bleu (`name_outline`). 2 à 5 joueurs, 30 minutes, tapis rouge de la boîte (#C4302B) et logo tête de taureau bleue (#2B3A8F, silhouette fournie par l'utilisateur). Mode Connaisseur, « Tes cartes » : cartes d'origine 1-7-13, 15-19-22, 30-35-39, 40-46-52 et 53-54, chacune aux couleurs de son nombre de têtes, taureau en grand et numéro par-dessus. **54 cartes** (le paquet et les 2 jokers), rien à retirer. Force : trèfle 1 à 13, pique 14 à 26, carreau 27 à 39, cœur 40 à 52, jokers 53 et 54 (« Tes cartes » : une ligne par couleur). Points (« Compter les points ») : dame de pique 7, rois 5, 10 3, 5 2, les autres 1. Fin dès qu'un joueur atteint 66 ; le moins de points gagne.
4. **Tarot africain** *(réalisé, version MastersCards ; cahier : `build_ressources/MasterCards/TarotAfricain/CAHIER_DES_CHARGES.md`)*. 2 à 4 joueurs, 20 minutes, tapis terre cuite (#A4471E). Jeu de plis à annonces, joué d'origine avec les 22 atouts du tarot. **22 cartes** : pique as à 10 = 1 à 10, cœur as à 10 = 11 à 20, roi de cœur = 21, **1 joker** = l'Excuse (0 ou 22, au choix en la posant). Quatre groupes. Manches à 5, 4, 3, 2 puis 1 carte, et on recommence ; le donneur annonce en dernier sans faire tomber le total juste ; à la manche à 1 carte, chacun pose sa carte sur son front. 1 point par pli d'écart ; fin dès qu'un joueur atteint 13 ; le moins de points gagne.
5. **Loup-garou** *(réalisé, règles de base)*. 6 à 12 joueurs, plus un **meneur** sans carte, 30 minutes, tapis rouge, celui de la carte du loup (#D42821). **16 cartes** en réserve, on en prend une par joueur : rois de pique, trèfle et carreau = loups-garous (2, ou 3 à 12 joueurs) ; 2 à 9 de cœur = villageois ; dame de cœur = voyante ; dame de pique = sorcière ; valet de pique = chasseur ; as de cœur = cupidon ; dame de carreau = petite fille. Sept groupes (« Rôle 1 / 7 »). Le mode Classique parle en cartes, le Connaisseur donne le rôle (noms interdits en Classique). En Connaisseur, chaque rôle a sa **carte d'origine carrée**, en image (`carte-*.webp`), découpée avec `npm run planche` d'une planche générée par Gemini et fournie par l'utilisateur (`build_ressources/MasterCards/LoupGarou/`). Ces dessins s'inspirent de près des cartes d'origine : l'utilisateur en répond, comme pour la planche de Trio (7.10). Sur l’accueil, la vignette montre le motif de la carte du loup, détouré (`logo.png`), sur ce rouge. Pas de score dans le jeu : à chaque manche, chaque joueur du camp gagnant marque 1 point ; pas de fin automatique (« Terminer la partie »).

> Les textes viennent des **maquettes, mot pour mot**. Rédigés par nous, à relire : pour Trio, cinq textes de la vue à balayer ; pour Love Letter, les règles complètes, les détails de groupe et les noms de groupe (Jokers, Dame de cœur).

### 9.4 Persistance locale
Via `src/core/storage.ts` : `@capacitor/preferences` dans les apps natives (non purgé par le système), `localStorage` sur le web, avec repli silencieux si le navigateur le bloque.
- **Mode de lecture** (Classique / Connaisseur), changé par la bascule de « Tes cartes ».
- **Message de bienvenue** déjà vu.
- **Partie en cours**, par jeu (`session:<id>`) : joueurs, scores, manche et marque `unnamed` (partie sans prénoms). Relue avec validation stricte : une donnée abîmée est ignorée, l'app démarre normalement ; l'ancien format (`trios`, sans manche) est relu. « Terminer la partie » l'efface.
- **Historique** (`history`) : les 100 dernières parties (jeu, date, statut, scores). Les entrées abîmées sont ignorées une à une.
- **Nouveautés vues** (`news-seen`) : la liste des `id` des nouveautés déjà montrées en popup. Absente au premier lancement : les notes actuelles y sont écrites, sans popup ; absente (ou ancien numéro de version) alors que le mot de bienvenue a été vu : les notes `popup` s'affichent.

Aucune donnée n'est indispensable au fonctionnement : sans stockage, l'app reste utilisable.

## 10. Spécifications techniques

### 10.1 Stack
- **Vite + React + TypeScript** en mode `strict`.
- **PWA** : `vite-plugin-pwa` (Workbox, précache de tout le build, mise à jour automatique), manifeste `display: standalone`, `orientation: portrait`.
- **Capacitor 8** : `@capacitor/core`, plugins `preferences`, `status-bar`, `splash-screen`. Projets natifs `android/` et `ios/` versionnés dans le dépôt.
- Navigation : `react-router`.
- État : état local React et contexte. Pas de bibliothèque d'état tant que le besoin n'existe pas (les préférences tiennent en 2 ou 3 valeurs).
- Qualité : `oxlint`, Prettier, `tsc -b`.
- Tests : Vitest + Testing Library (unitaires et composants), Playwright (PWA hors ligne, captures du design system).
- Versions minimales : navigateurs récents (Chrome/Safari/Firefox, 2 dernières années), iOS 15+, Android 7+ (WebView à jour), à confirmer avec le jalon 6.
- Orientation : portrait uniquement (manifeste, `AndroidManifest.xml`, `Info.plist`).

### 10.2 Architecture
Organisation par fonctionnalités :

```
src/
  core/          # tokens générés, contraste, couleurs, cartes, polices, storage, init native, balayage
  content/games/ # <id>/game.yaml + logo et police du jeu ; game.schema.json
  data/          # types, chargement des jeux (loadGame), plan du paquet (deck), thème, filtres
  state/         # partie en cours (session), historique, mode de lecture, drapeaux mémorisés
  i18n/          # textes de l'interface (fr)
  features/
    home/ game-detail/ rules/ about/
    cards/       # Tes cartes (liste) et vue à balayer
    tutorial/    # mise en place, un tour
    players/     # Qui joue ?
    party/       # partie en cours, saisie des scores
    results/ history/ settings/   # podium, Tes scores, Réglages
    dev/         # page de visite du design system (dev uniquement)
  components/    # design system partagé
  styles/        # tokens générés + styles globaux
scripts/         # gen-tokens, gen-icons, render-maquettes, garde-fous
e2e/             # tests Playwright (parcours, hors ligne, aucun défilement, fidélité aux maquettes)
charte/  docs/  maquettes/
android/  ios/   # projets natifs Capacitor
```

### 10.2 bis Adresses
| Adresse | Écran |
|---|---|
| `/` | Accueil : choix du jeu |
| `/jeu/:id` | Le jeu : « Jouer » ou « Règles complètes » |
| `/jeu/:id/regles` | Règles complètes |
| `/jeu/:id/tutoriel/cartes` | Tes cartes : vue liste (bascule de mode) |
| `/jeu/:id/tutoriel/cartes/3` | Vue à balayer, ouverte sur le groupe 3 (à partir de 1) |
| `/jeu/:id/tutoriel/mise-en-place` | Mise en place |
| `/jeu/:id/tutoriel/tour` | Un tour de jeu |
| `/jeu/:id/tutoriel/points` | Compter les points (facultatif ; `?depuis=scores` : ouvert depuis la saisie des scores) |
| `/jeu/:id/joueurs` | Qui joue ? |
| `/jeu/:id/partie` | Partie en cours |
| `/jeu/:id/partie/scores` | Saisie des scores (points gagnés, ajoutés à la validation) |
| `/jeu/:id/resultat/:partieId` | Podium d'une partie terminée ou interrompue |
| `/scores` | Historique « Tes scores » |
| `/reglages` | Réglages |
| `/a-propos` | Mentions légales, crédits, version |

Toutes les adresses sont construites par `src/routes.ts`. Depuis la partie, les écrans de règles, cartes, mise en place et tour s'ouvrent avec `?depuis=partie` : le retour mène à la partie. Un groupe, un jeu ou une page inconnus affichent « introuvable ».

### 10.3 Performance
- Démarrage < 2 s sur appareil milieu de gamme.
- 60 fps dans les écrans de règles (animations en `transform` et `opacity` uniquement).
- Poids : JS initial < 150 Ko gzip ; polices limitées au sous-ensemble latin et aux graisses utilisées.
- Lighthouse : score PWA « installable » et accessibilité ≥ 95.

### 10.4 Accessibilité
- Texte ≥ 16 px, zones tactiles ≥ 44 px, contraste ≥ 4,5.
- Libellés sémantiques (`aria-label`, `role="img"`) sur cartes et jetons : « Roi de cœur », « Jeton rouge, valeur 25 ».
- Ne pas faire reposer le sens sur la seule couleur (rouge/noir des cartes toujours accompagné du symbole).
- Respect de la taille de texte système (jusqu'à 130 % sans casse de mise en page) : unités `rem`, zoom autorisé (pas de `user-scalable=no`).
- Zones sûres (encoche, barre de gestes) gérées par `viewport-fit=cover` et `env(safe-area-inset-*)`.
- Respect de `prefers-reduced-motion`.
- Focus clavier visible.

### 10.5 Données personnelles
Aucune collecte en v1, aucun compte, pas de tracking. Si des statistiques sont ajoutées plus tard : consentement et politique de confidentialité obligatoires.

### 10.6 Hors ligne et mises à jour
- Le service worker précache tout le build (code, polices, JSON des jeux, icônes). L'app démarre sans réseau dès la deuxième visite.
- Mise à jour automatique : une nouvelle version est téléchargée en arrière-plan et prend effet au prochain lancement.
- **Nouveautés** : l'auteur choisit, note par note (`src/content/changelog.yaml`, la plus récente en tête, un `id` chacune, sans numéro de version), si elle s'affiche au lancement (`popup` : une fois par utilisateur, à balayer s'il y en a plusieurs, 5 au plus) et si elle est disponible dans Réglages → « Nouveautés » (`listed`, à balayer, de la plus récente à la plus ancienne). Une note peut nommer un jeu (`game`) : sa vignette et « Voir le jeu ».
- Dans les apps natives, le build web est **embarqué dans le binaire** : le hors ligne fonctionne dès l'installation, sans service worker.

### 10.7 Distribution
- **Web (v1)** : build statique `dist/` servi par n'importe quel hébergeur statique, avec repli de toutes les routes vers `index.html`. HTTPS obligatoire (service worker).
- **Stores (décision au jalon 6)** : `npm run cap:sync`, puis build et signature dans Android Studio (SDK Android) et Xcode (Mac obligatoire). Comptes développeur : Apple 99 $/an, Google 25 $ une fois.
- **SEO** : une SPA classique est mal indexée. Si le référencement des pages par jeu devient un objectif, évaluer un prérendu statique au jalon 6 (par exemple `vite-react-ssg`).

---

## 11. Critères d'acceptation

- [x] Chaque écran de Trio et de Love Letter est **conforme à sa maquette, mesuré** : moins de 1 % de pixels différents (`e2e/maquettes.spec.ts`), écarts assumés listés en 7.10.
- [x] Chaque écran tient sans défilement vertical à 390 × 844 et 393 × 852 (test automatisé), sauf « Un tour », qui défile au besoin.
- [x] Le mode de lecture se choisit après le jeu, jamais à l'accueil.
- [x] Aucune couleur / rayon / espacement / taille de texte en dur (`scripts/no-hardcoded-values.test.ts`).
- [x] Un nouveau jeu s'ajoute avec un seul `game.yaml` (logo et police facultatifs), sans modification de code : prouvé en déposant `docs/modele-jeu.yaml` comme troisième jeu, qui passe les tests de chaque jeu (`src/data/games.test.ts`, `e2e/jeux.spec.ts`, « aucun défilement »).
- [x] Les termes d'origine interdits par un jeu n'apparaissent pas dans ses textes (test, champ `classic_forbidden_terms`).
- [x] Contraste ≥ 4,5 pour tous les couples texte/fond, y compris fond « libre » (`src/data/theme.test.ts`, `src/data/games.test.ts`).
- [ ] Aucun logo ou lettrage officiel dans le dépôt.
- [x] App 100 % fonctionnelle hors ligne (`e2e/pwa.spec.ts`, `e2e/app.spec.ts` : rechargement sans réseau).
- [x] App installable : manifeste valide, icônes 192, 512 et maskable (`e2e/pwa.spec.ts`).
- [x] `npm run lint`, `npm run typecheck`, `npm test` sans erreur.
- [x] `npx cap sync` sans erreur.
- [ ] Testé sur au moins un petit et un grand écran, sur iOS (Safari) et Android (Chrome).
- [ ] Si publication sur les stores : build natif Android et iOS testé sur appareil réel.

---

## 12. Plan de réalisation (jalons pour Claude Code)

**Jalon 0 : initialisation** *(réalisé)*
Projet Vite + React + TypeScript strict, structure de dossiers, lint (oxlint + Prettier), tests (Vitest, Playwright), PWA (manifeste, service worker, icônes), Capacitor (Android + iOS, portrait, `cap sync`), CI de base. `CLAUDE.md`, charte et maquettes copiés dans le dépôt.

**Jalon 1 : design system** *(réalisé)*
Tokens générés depuis le JSON (variables CSS + TypeScript), garde-fou « aucune valeur en dur », contraste WCAG, polices embarquées, `Button`, `PlayingCard`, `PokerChip`, page de visite `/dev/design-system`, tests de composants et captures Playwright.

**Jalon 2 : données** *(réalisé, avec Trio)*
Types, schéma JSON (`game.schema.json`), configuration YAML par jeu (`game.yaml`, lue au build, `loadGame`), plan du paquet carte par carte (`deckPlan`, `removalList`), thème et police par jeu, tests de validation éditoriale. Trio en contenu de référence.

**Jalons 3 et 4 : écrans de Trio d'après les maquettes** *(réalisés)*
Page du jeu, tutoriel (Tes cartes en deux modes, vue à balayer, mise en place, un tour), règles complètes, partie en cours, trios gagnés, plus « Qui joue ? ». Charte v6 (ombres de tapis, carte fantôme, voile, rayon 16). **Test de fidélité pixel à pixel** aux maquettes.

**Jalon 5 : second jeu et finitions** *(en partie)*
Fait : page À propos et mentions légales, états vides, erreur et premier lancement ; **second jeu, Love Letter** (manches, podium, historique, réglages, accueil « Tes jeux » avec onglets, recherche et filtres), **refonte « un jeu = une configuration »** (mêmes écrans et même fonctionnement pour tous, scores identiques et score visé par jeu, police et logo dans le dossier du jeu, `docs/modele-jeu.yaml`, tests qui parcourent chaque jeu sans le nommer), « Passer cette étape » et parties sans prénoms. Reste : accessibilité à auditer sur appareil, performances (Lighthouse).

**Jalon 6 : publication**
Hébergement web et nom de domaine, icône et écran de lancement natifs (`@capacitor/assets`), vérification des droits (voir section 6), puis, si décidé : builds Android et iOS, fiches et captures de stores, plugin d'écran maintenu allumé.

### Prompt de démarrage conseillé pour Claude Code

> Lis `CLAUDE.md` puis `docs/CAHIER_DES_CHARGES.md`. Reprends au jalon 5 (finitions) ou ajoute un troisième jeu (copie `docs/modele-jeu.yaml` dans `src/content/games/<id>/game.yaml`, sans toucher au code). Utilise `charte/masterscards-charte.json` comme seule source des tokens et les images de `maquettes/<jeu>/` comme référence. Avant de coder, propose-moi la liste des fichiers que tu vas créer.

---

## 13. Questions ouvertes

1. Quels jeux au-delà de Love Letter et Trio pour la v1 ?
2. Qui rédige et relit les règles (classique et connaisseur) ?
3. ~~Un paquet de 52 cartes, ou avec jokers (54) ?~~ *Tranché : 52 cartes, plus les jokers quand un jeu en demande (`jokers` dans le groupe, 2 au plus). Love Letter en prend 2 (les Espionnes).*
4. Langues autres que le français ?
5. Modèle économique (gratuit, achat unique, abonnement, pub) ? Il décide si les stores sont nécessaires.
6. Où sont hébergées les maquettes définitives ? Lien du canvas à conserver dans le dépôt.
7. Validation juridique des noms de jeux avant publication.
8. Hébergement web et nom de domaine.
9. Identifiant d'application définitif (`io.masterscards.app` est provisoire) : à fixer avant toute publication sur un store.
10. Prérendu statique des pages par jeu pour le référencement : nécessaire ou non ?
11. ~~Love Letter : comment représenter les cartes avec un paquet de 52 ?~~ *Tranché : 6 Gardes = 4 valets + 2 rois noirs ; avec la règle de 2019 : Espionnes = jokers, Princesse = dame de cœur, 21 cartes (7.10).*
12. Relecture éditoriale de Trio : les textes viennent des maquettes ; cinq textes de la vue à balayer (A, 2 à 6, 8 à 10, Valet, Dame) ont été rédigés sur le même modèle. « Un tour » (maquette) dit « puis une deuxième » alors qu'on peut retourner jusqu'à trois cartes : à confirmer.
13. Durée de Trio : « environ 15 minutes » d'après l'éditeur et les revendeurs, une source indique 15 à 20 minutes.
14. ~~Maquette de l'accueil~~ *Fournie avec la galerie Love Letter (« Tes jeux »), réalisée.* Filtres définis par l'utilisateur : « Tous », « 2 joueurs », « Rapide », « Sans joker », sur une ligne qui défile.
15. Écran **« Qui joue ? »** (ajouté, sans maquette) : à valider ou à remplacer par la maquette.
16. ~~Maquettes d'un second jeu~~ *Reçues et réalisées (Love Letter).*
17. Love Letter : relire les textes rédigés par nous (règles complètes, détails de groupe) ; confirmer les exemplaires par carte (2 Espionnes, 6 Gardes, 2 Prêtres, 2 Barons, 2 Servantes, 2 Princes, 2 Chanceliers, 1 Roi, 1 Comtesse, 1 Princesse : la page de règles ne les donne pas) ; le mode particulier à 2 joueurs (3 cartes visibles) est abandonné ; Roi = 7♥ et Comtesse = 8♠ validés par l'utilisateur. Le filtre « 2–4 joueurs » signifie désormais « se joue avec 2, 3 ou 4 joueurs » : Love Letter (2–6) et Trio (3–6) y répondent tous les deux.
18. Trio se termine seul au 3e trio (`target: 3`) et mène au podium et à l'historique. Le trio de 7 (victoire immédiate) se note en ajoutant 3 au gagnant : à confirmer, ou à traiter dans une version ultérieure.
19. Langues English et Español : affichées grisées dans les Réglages, à traduire ou à retirer.
20. **« Jouer » ouvre toujours « Tes cartes »**, pour tous les jeux (décision de l'utilisateur) : le raccourci « tutoriel passé » et ses Réglages ont été retirés.
21. « Passer cette étape » sur « Qui joue ? » démarre une partie sans prénoms (pas de jetons, prénoms demandés pour noter les scores) : à valider à l'usage.
