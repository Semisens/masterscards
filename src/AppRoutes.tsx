import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AboutPage } from './features/about/AboutPage.tsx'
import { CardSwipePage } from './features/cards/CardSwipePage.tsx'
import { CardsPage } from './features/cards/CardsPage.tsx'
import { GameScope } from './features/game-scope/GameScope.tsx'
import { GameDetailPage } from './features/game-detail/GameDetailPage.tsx'
import { HistoryPage } from './features/history/HistoryPage.tsx'
import { HomePage } from './features/home/HomePage.tsx'
import { NotFoundPage } from './features/not-found/NotFoundPage.tsx'
import { PartyPage } from './features/party/PartyPage.tsx'
import { ScorePage } from './features/party/ScorePage.tsx'
import { PointsPage } from './features/tutorial/PointsPage.tsx'
import { PlayersPage } from './features/players/PlayersPage.tsx'
import { ResultsPage } from './features/results/ResultsPage.tsx'
import { RulesPage } from './features/rules/RulesPage.tsx'
import { SettingsPage } from './features/settings/SettingsPage.tsx'
import { SetupPage } from './features/tutorial/SetupPage.tsx'
import { TurnPage } from './features/tutorial/TurnPage.tsx'

// La page de visite du design system n'existe qu'en développement : elle est absente du build de production.
const DesignSystemPage = import.meta.env.DEV
  ? lazy(() => import('./features/dev/DesignSystemPage.tsx').then((m) => ({ default: m.DesignSystemPage })))
  : null

/** Toutes les routes de l'app (adresses : voir `src/routes.ts`). Séparées de `App` pour être testées en mémoire. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Dans un jeu, l'app prend ses couleurs (fond, pastilles, dos de carte) : voir GameScope. */}
      <Route path="/jeu/:gameId" element={<GameScope />}>
        <Route index element={<GameDetailPage />} />
        <Route path="regles" element={<RulesPage />} />
        <Route path="tutoriel/cartes" element={<CardsPage />} />
        <Route path="tutoriel/cartes/:groupe" element={<CardSwipePage />} />
        <Route path="tutoriel/mise-en-place" element={<SetupPage />} />
        <Route path="tutoriel/tour" element={<TurnPage />} />
        <Route path="tutoriel/points" element={<PointsPage />} />
        <Route path="joueurs" element={<PlayersPage />} />
        <Route path="partie" element={<PartyPage />} />
        <Route path="partie/scores" element={<ScorePage />} />
        <Route path="resultat/:partieId" element={<ResultsPage />} />
      </Route>
      <Route path="/scores" element={<HistoryPage />} />
      <Route path="/reglages" element={<SettingsPage />} />
      <Route path="/a-propos" element={<AboutPage />} />
      {DesignSystemPage && (
        <Route
          path="/dev/design-system"
          element={
            <Suspense fallback={null}>
              <DesignSystemPage />
            </Suspense>
          }
        />
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
