import { describe, expect, it } from 'vitest'
import { FROM_PARTY, FROM_SCORES, paths } from './routes.ts'

describe('paths', () => {
  it('construit chaque adresse du parcours', () => {
    expect(paths.home()).toBe('/')
    expect(paths.about()).toBe('/a-propos')
    expect(paths.game('trio')).toBe('/jeu/trio')
    expect(paths.rules('trio')).toBe('/jeu/trio/regles')
    expect(paths.cards('trio')).toBe('/jeu/trio/tutoriel/cartes')
    expect(paths.group('trio', 3)).toBe('/jeu/trio/tutoriel/cartes/3')
    expect(paths.setup('trio')).toBe('/jeu/trio/tutoriel/mise-en-place')
    expect(paths.turn('trio')).toBe('/jeu/trio/tutoriel/tour')
    expect(paths.points('6-qui-prend')).toBe('/jeu/6-qui-prend/tutoriel/points')
    expect(paths.players('trio')).toBe('/jeu/trio/joueurs')
    expect(paths.party('trio')).toBe('/jeu/trio/partie')
    expect(paths.scores('trio')).toBe('/jeu/trio/partie/scores')
  })

  it('ajoute le contexte « depuis la partie » aux écrans consultables pendant la partie', () => {
    const suffix = `?${FROM_PARTY.param}=${FROM_PARTY.value}`
    expect(paths.rules('trio', true)).toBe(`/jeu/trio/regles${suffix}`)
    expect(paths.cards('trio', true)).toBe(`/jeu/trio/tutoriel/cartes${suffix}`)
    expect(paths.group('trio', 2, true)).toBe(`/jeu/trio/tutoriel/cartes/2${suffix}`)
    expect(paths.setup('trio', true)).toBe(`/jeu/trio/tutoriel/mise-en-place${suffix}`)
    expect(paths.turn('trio', true)).toBe(`/jeu/trio/tutoriel/tour${suffix}`)
  })

  it('ouvre « Compter les points » depuis la saisie des scores', () => {
    expect(paths.points('6-qui-prend', true)).toBe(
      `/jeu/6-qui-prend/tutoriel/points?${FROM_SCORES.param}=${FROM_SCORES.value}`,
    )
  })

  it('n’ajoute rien quand on n’est pas dans une partie', () => {
    expect(paths.cards('trio', false)).not.toContain('?')
  })

  it('met le mode ailleurs que dans l’adresse : un seul jeu d’adresses pour les deux modes', () => {
    expect(paths.cards('trio')).not.toMatch(/classique|connaisseur/)
  })
})
