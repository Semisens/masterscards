import { useSearchParams } from 'react-router'
import { FROM_PARTY, FROM_SCORES } from '../../routes.ts'

/** Vrai quand l'écran a été ouvert depuis « Partie en cours » (`?depuis=partie`). */
export function useFromParty(): boolean {
  const [params] = useSearchParams()
  return params.get(FROM_PARTY.param) === FROM_PARTY.value
}

/** Vrai quand « Compter les points » a été ouvert depuis la saisie des scores (`?depuis=scores`). */
export function useFromScores(): boolean {
  const [params] = useSearchParams()
  return params.get(FROM_SCORES.param) === FROM_SCORES.value
}
