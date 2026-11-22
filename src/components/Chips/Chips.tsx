import { useId } from 'react'
import styles from './Chips.module.css'

export interface ChipOption<T extends string> {
  value: T
  label: string
}

export interface ChipsProps<T extends string> {
  legend: string
  options: ChipOption<T>[]
  value: T
  onChange: (value: T) => void
}

/**
 * Pastilles de filtre : une seule est choisie (jaune), les autres sont bleu nuit. De vrais boutons radio.
 * Une seule ligne, qui défile au doigt jusqu'aux bords de l'écran quand les pastilles ne tiennent pas.
 */
export function Chips<T extends string>({ legend, options, value, onChange }: ChipsProps<T>) {
  const name = useId()
  return (
    <fieldset className={styles.chips}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.row}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.label}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
