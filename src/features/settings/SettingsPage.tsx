import { useState } from 'react'
import { Button } from '../../components/Button/Button.tsx'
import { ButtonLink } from '../../components/Button/ButtonLink.tsx'
import { NewsDialog } from '../../components/NewsDialog/NewsDialog.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { Segmented } from '../../components/Segmented/Segmented.tsx'
import { listedNotes, newsNotes } from '../../data/news.ts'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import styles from './SettingsPage.module.css'

// Seul le français existe pour l'instant : les autres langues s'affichent, grisées.
const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English', disabled: true },
  { value: 'es', label: 'Español', disabled: true },
]

// Les nouveautés disponibles dans les réglages (`listed`), la plus récente d'abord.
const NOTES = listedNotes(newsNotes)

/** Réglages : la langue, les nouveautés et le lien « À propos ». Aucun compte en v1. */
export function SettingsPage() {
  const [newsOpen, setNewsOpen] = useState(false)

  return (
    <Screen tabs>
      <PageTitle>{fr.settings.title}</PageTitle>
      <span>{fr.settings.language}</span>
      <Segmented legend={fr.settings.language} options={LANGUAGES} value="fr" onChange={() => {}} />
      <p className={styles.note}>{fr.settings.languageSoon}</p>

      <div className={styles.spacer} />
      {NOTES.length > 0 && (
        <Button block variant="blanc" onClick={() => setNewsOpen(true)}>
          {fr.settings.news}
        </Button>
      )}
      <ButtonLink block variant="blanc" to={paths.about()}>
        {fr.settings.about}
      </ButtonLink>

      {newsOpen && <NewsDialog notes={NOTES} onClose={() => setNewsOpen(false)} />}
    </Screen>
  )
}
