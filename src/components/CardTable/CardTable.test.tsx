import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardTable } from './CardTable.tsx'

const TRIO_HAND = { label: 'Ta main, triée', layout: 'spread' as const }
const TRIO_CENTER = [{ label: 'Au centre, cachées', layout: 'grid' as const }]

const faceUp = (container: HTMLElement) =>
  [...container.querySelectorAll('[role="img"]')]
    .map((card) => card.getAttribute('aria-label'))
    .filter((label) => label !== 'Dos de carte')

describe('CardTable', () => {
  it('légende ta main et ce qui se pose au centre', () => {
    const { container } = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} />)
    expect(container).toHaveTextContent('Ta main, triée')
    expect(container).toHaveTextContent('Au centre, cachées')
  })

  it('dessine quatre mains et le centre, sans bruit pour les lecteurs d’écran', () => {
    const { container } = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} />)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4 + 1)
  })

  it('donne aux quatre mains la disposition de ta main', () => {
    const pile = [{ label: 'Pioche', layout: 'pile' as const }]
    const spread = render(<CardTable hand={TRIO_HAND} center={pile} />)
    // 4 mains en éventail (3 dos chacune), plus la pile du centre (3 dos).
    expect(spread.container.querySelectorAll('[role="img"]')).toHaveLength(4 * 3 + 3)
    spread.unmount()

    const single = render(<CardTable hand={{ label: 'Ta main', layout: 'single' }} center={pile} />)
    expect(single.container.querySelectorAll('[role="img"]')).toHaveLength(4 * 1 + 3)
  })

  it('aligne les cartes du centre quand le jeu le demande', () => {
    const { container } = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} />)
    // 4 mains en éventail (3 dos chacune), plus 6 dos alignés au centre.
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(4 * 3 + 6)
  })

  it('pose plusieurs éléments au centre, dont une carte visible quand le jeu en donne une', () => {
    const center = [
      { label: 'Pioche', layout: 'pile' as const },
      { label: 'Défausse', card: { rank: '5' as const, suit: 'hearts' as const } },
    ]
    const { container, getByRole } = render(<CardTable hand={{ label: 'Ta main' }} center={center} />)
    expect(container).toHaveTextContent('Pioche')
    expect(getByRole('img', { name: 'Défausse' })).toBeInTheDocument()
    // 4 mains d'une carte, la pioche (3 dos) et la carte visible.
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(4 + 3 + 1)
  })

  it('reflète chaque légende du centre au-dessus des cartes, sans dupliquer le texte', () => {
    const { container } = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} />)
    expect(container.querySelector('[data-label="Au centre, cachées"]')).not.toBeNull()
    expect(screen.getAllByText('Au centre, cachées')).toHaveLength(1)
  })

  it('pose les cartes mises de côté dans le coin, hors du centre, et garde les autres au centre', () => {
    const center = [
      { label: 'Pioche', layout: 'pile' as const },
      { label: 'Cartes de côté', layout: 'pile' as const, aside: true },
    ]
    const { container } = render(<CardTable hand={{ label: 'Ta main' }} center={center} />)
    // Au centre, la pioche a le reflet de sa légende ; dans le coin, la légende est seule, sous les cartes.
    expect(container.querySelector('[data-label="Pioche"]')).not.toBeNull()
    expect(container.querySelector('[data-label="Cartes de côté"]')).toBeNull()
    expect(screen.getAllByText('Cartes de côté')).toHaveLength(1)
    // 4 mains d'une carte et deux piles de 3 dos : rien ne disparaît.
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(4 + 3 + 3)
  })

  it('jeux de plis : le pli au milieu, 3 cartes pour qui a joué, 4 pour les autres, ta carte prête à jouer', () => {
    const hand = { label: 'Ta main, 5 cartes', layout: 'spread' as const }
    const center = [{ label: 'Cartes de côté', layout: 'pile' as const, aside: true }]
    const reveal = {
      hand: [
        { rank: '3' as const, suit: 'spades' as const },
        { rank: '7' as const, suit: 'hearts' as const },
        { rank: 'K' as const, suit: 'hearts' as const },
      ],
      trick: {
        across: { rank: '9' as const, suit: 'spades' as const },
        right: { rank: '2' as const, suit: 'spades' as const },
      },
      next: { rank: '8' as const, suit: 'hearts' as const },
    }
    const { container } = render(<CardTable hand={hand} center={center} reveal={reveal} />)
    expect(faceUp(container)).toEqual([
      '9 de pique',
      '2 de pique',
      '3 de pique',
      '7 de cœur',
      'Roi de cœur',
      '8 de cœur',
    ])
    // Ta carte prête à jouer est la dernière de ta main : 4 cartes de face, en bas.
    const yours = container.querySelectorAll('[aria-label="8 de cœur"]')[0]?.parentElement
    expect(yours?.children).toHaveLength(4)
    // Dos : en face 3, à gauche 4 (pas encore joué), à droite 3, plus la pile de côté (3).
    expect(container.querySelectorAll('[aria-label="Dos de carte"]')).toHaveLength(3 + 4 + 3 + 3)
  })

  it('retourne la carte du bord de la main d’en face et une carte du centre (un tour)', () => {
    const reveal = {
      across: { rank: 'A' as const, suit: 'spades' as const },
      center: [{ rank: '4' as const, suit: 'hearts' as const }],
    }
    const { container } = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} reveal={reveal} />)
    expect(faceUp(container)).toEqual(['As de pique', '4 de cœur'])
  })

  it('montre ta main de face et une carte découverte à côté de la main des joueurs qui en ont une', () => {
    const card = (rank: '3' | '5' | 'J' | 'Q', suit: 'hearts' | 'spades' | 'clubs') => ({ rank, suit })
    const reveal = {
      hand: [card('5', 'hearts'), card('Q', 'hearts')],
      played: { across: card('3', 'spades'), right: card('J', 'clubs') },
    }
    const center = [{ label: 'Pioche', layout: 'pile' as const }]
    const hand = { label: 'Ta main', layout: 'single' as const }
    const setup = render(<CardTable hand={hand} center={center} />).container
    const turn = render(<CardTable hand={hand} center={center} reveal={reveal} />).container
    expect(faceUp(turn)).toEqual(['3 de pique', 'Valet de trèfle', '5 de cœur', 'Dame de cœur'])
    // Les autres mains gardent leurs dos ; ta main passe d'une carte de dos à deux cartes de face.
    expect(turn.querySelectorAll('[aria-label="Dos de carte"]')).toHaveLength(
      setup.querySelectorAll('[aria-label="Dos de carte"]').length - 1,
    )
  })

  it('reste la même table avec des cartes retournées : mêmes cartes, mêmes légendes, même structure', () => {
    const reveal = {
      across: { rank: 'A' as const, suit: 'spades' as const },
      center: [{ rank: '4' as const, suit: 'hearts' as const }],
    }
    const setup = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} />).container
    const turn = render(<CardTable hand={TRIO_HAND} center={TRIO_CENTER} reveal={reveal} />).container
    expect(turn.querySelectorAll('[role="img"]')).toHaveLength(setup.querySelectorAll('[role="img"]').length)
    // Les légendes : le texte hors des cartes (une carte retournée montre son rang, c'est voulu).
    const labels = (root: HTMLElement) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const texts: string[] = []
      while (walker.nextNode())
        if (!walker.currentNode.parentElement?.closest('[role="img"]')) texts.push(walker.currentNode.textContent ?? '')
      return texts.join('')
    }
    expect(labels(turn)).toBe(labels(setup))
    // Tout ce qui entoure les cartes (sièges, centre, légendes) est identique : seules les cartes changent de face.
    const frame = (root: HTMLElement) =>
      [...root.querySelectorAll<HTMLElement>('*')]
        .filter((element) => !element.closest('[role="img"]'))
        .map((element) => `${element.tagName}.${element.className}`)
    expect(frame(turn)).toEqual(frame(setup))
  })
})
