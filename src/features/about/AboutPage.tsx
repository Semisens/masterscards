import { Panel } from '../../components/Panel/Panel.tsx'
import { Screen } from '../../components/Screen/Screen.tsx'
import { StepHeader } from '../../components/StepHeader/StepHeader.tsx'
import { PageTitle } from '../../components/PageTitle/PageTitle.tsx'
import { fr } from '../../i18n/fr.ts'
import { paths } from '../../routes.ts'
import styles from './AboutPage.module.css'

/** Le principe de l'app (le même texte que le mot de bienvenue), mentions légales, données, version et polices. */
export function AboutPage() {
  return (
    <Screen>
      <StepHeader backTo={paths.settings()} />
      <PageTitle>{fr.about.title}</PageTitle>

      <Panel labelledBy="about-principle" className={styles.panel}>
        <h2 id="about-principle" className={styles.heading}>
          {fr.about.principleTitle}
        </h2>
        <p>{fr.about.principle}</p>
      </Panel>

      {/* Mentions légales et données personnelles réunies : la page tient sans défilement. */}
      <Panel labelledBy="about-legal" className={styles.panel}>
        <h2 id="about-legal" className={styles.heading}>
          {fr.about.legalTitle}
        </h2>
        <p>{fr.about.disclaimer}</p>
        <p>{fr.about.namesNote}</p>
        <p>{fr.about.privacy}</p>
      </Panel>

      <Panel labelledBy="about-version" className={styles.panel}>
        <h2 id="about-version" className={styles.heading}>
          {fr.about.versionTitle}
        </h2>
        <p>{__APP_VERSION__}</p>
        <p>{fr.about.fonts}</p>
      </Panel>
    </Screen>
  )
}
