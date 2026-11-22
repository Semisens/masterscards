import styles from './ScoreStepper.module.css'

export interface ScoreStepperProps {
  name: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** Ce qu'on compte, au singulier : « trio », « point ». Sert aux libellés pour lecteurs d'écran. */
  unit?: string
  /** Mise en page serrée (plus de 6 joueurs, sur deux colonnes) : le prénom au-dessus, − valeur + dessous. */
  compact?: boolean
}

/** Ligne de saisie d'un score : le nom du joueur, un bouton −, le nombre, un bouton +. */
export function ScoreStepper({
  name,
  value,
  onChange,
  min = 0,
  max = 99,
  unit = 'point',
  compact = false,
}: ScoreStepperProps) {
  return (
    <div className={compact ? `${styles.row} ${styles.compact}` : styles.row}>
      <span className={styles.name}>{name}</span>
      <button
        type="button"
        className={styles.button}
        aria-label={`Un ${unit} de moins pour ${name}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <b className={styles.value} aria-live="polite" aria-label={`${name} : ${value}`}>
        {value}
      </b>
      <button
        type="button"
        className={styles.button}
        aria-label={`Un ${unit} de plus pour ${name}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
