import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { NewsNote } from '../../data/news.ts'
import { NewsDialog } from './NewsDialog.tsx'

const NOTES: NewsNote[] = [
  { id: 'troisieme', popup: true, listed: true, title: 'Troisième', text: 'Texte 3.', items: ['Une puce'] },
  { id: 'deuxieme', popup: true, listed: true, title: 'Deuxième', text: 'Texte 2.', game: 'trio' },
  { id: 'premiere', popup: true, listed: true, title: 'Première', text: 'Texte 1.' },
]

function renderDialog(notes: NewsNote[], onClose = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<NewsDialog notes={notes} onClose={onClose} />} />
        <Route path="/jeu/:id" element={<p>Page du jeu</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return onClose
}

describe('NewsDialog', () => {
  it('montre une note seule, sans points ni chevrons', () => {
    renderDialog([NOTES[2]])
    expect(screen.getByRole('dialog', { name: 'Première' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nouveauté suivante' })).toBeNull()
    expect(screen.getByRole('button', { name: 'C’est compris' })).toBeInTheDocument()
  })

  it('passe d’une note à l’autre, puis se ferme sur la dernière', async () => {
    const onClose = renderDialog(NOTES)
    expect(screen.getByRole('img', { name: 'Nouveauté 1 sur 3' })).toBeInTheDocument()
    expect(screen.getByText('Une puce')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(screen.getByRole('dialog', { name: 'Deuxième' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Nouveauté suivante' }))
    expect(screen.getByRole('dialog', { name: 'Première' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nouveauté suivante' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'C’est compris' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('se ferme avec Échap ou la croix', async () => {
    const onClose = renderDialog(NOTES)
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('les flèches du clavier changent de note', async () => {
    renderDialog(NOTES)
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('dialog', { name: 'Deuxième' })).toBeInTheDocument()
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('dialog', { name: 'Troisième' })).toBeInTheDocument()
  })

  it('« Voir le jeu » ferme la popup et ouvre le jeu', async () => {
    const onClose = renderDialog([NOTES[1]])
    await userEvent.click(screen.getByRole('link', { name: 'Voir le jeu' }))
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByText('Page du jeu')).toBeInTheDocument()
  })
})
