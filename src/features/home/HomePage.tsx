import { useState } from 'react'
import { Button } from '../../components/Button/Button.tsx'
import { Chips } from '../../components/Chips/Chips.tsx'
import { EmptyState } from '../../components/EmptyState/EmptyState.tsx'
import { GameTile } from '../../components/GameTile/GameTile.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { NewsDialog } from '../../components/NewsDialog/NewsDialog.tsx'
import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { filterGames, type GameFilter } from '../../data/filters.ts'
import { games } from '../../data/games.ts'
import { fr } from '../../i18n/fr.ts'
import { useNews } from '../../state/useNews.ts'
import { useStoredFlag } from '../../state/useStoredFlag.ts'
import styles from './HomePage.module.css'

const FILTERS = [
  { value: 'all', label: fr.home.filterAll },
  { value: 'small', label: fr.home.filterSmall },
  { value: 'quick', label: fr.home.filterQuick },
] as const

/** Accueil « Tes jeux » : recherche, filtres, vignettes des jeux. Le mode de lecture se choisit ensuite, sur « Tes cartes ». */
export function HomePage() {
  // Premier lancement : un mot de bienvenue, une seule fois. `null` = pas encore lu, on n'affiche rien.
  const [welcomed, setWelcomed] = useStoredFlag('welcomed')
  // Après une mise à jour annoncée : la popup des nouveautés (src/content/changelog.yaml), une seule fois.
  const [news, dismissNews] = useNews()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<GameFilter>('all')
  const shown = filterGames(games, filter, query)

  return (
    <Screen tabs>
      <PageTitle>{fr.home.title}</PageTitle>

      {welcomed === false && (
        <Panel labelledBy="welcome-title">
          <h2 id="welcome-title" className={styles.welcomeTitle}>
            {fr.home.welcomeTitle}
          </h2>
          <p className={styles.welcomeText}>{fr.home.welcomeText}</p>
          <Button variant="soleil" onClick={() => setWelcomed(true)}>
            {fr.home.welcomeDismiss}
          </Button>
        </Panel>
      )}

      <label className={styles.search}>
        {fr.home.searchLabel}
        <input
          type="search"
          className={styles.input}
          placeholder={fr.home.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <Chips legend={fr.home.filtersLabel} options={[...FILTERS]} value={filter} onChange={setFilter} />

      {games.length === 0 ? (
        <EmptyState title={fr.home.emptyTitle} text={fr.home.emptyText} />
      ) : shown.length === 0 ? (
        <EmptyState title={fr.home.noMatchTitle} text={fr.home.noMatchText} />
      ) : (
        <ul className={styles.list}>
          {shown.map((game) => (
            <li key={game.id}>
              <GameTile game={game} />
            </li>
          ))}
        </ul>
      )}

      {news.length > 0 && <NewsDialog notes={news} onClose={dismissNews} />}
    </Screen>
  )
}
