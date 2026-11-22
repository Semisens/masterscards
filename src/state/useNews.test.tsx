import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { NewsNote } from '../data/news.ts'
import { useNews } from './useNews.ts'

const NOTES: NewsNote[] = [
  { id: 'nouveau', popup: true, listed: true, title: 'Nouveau', text: 'Texte.' },
  { id: 'ancien', popup: true, listed: true, title: 'Ancien', text: 'Texte.' },
  { id: 'archive', popup: false, listed: true, title: 'Archive', text: 'Texte.' },
]
const seen = () => JSON.parse(window.localStorage.getItem('masterscards:news-seen') ?? 'null')

describe('useNews', () => {
  beforeEach(() => window.localStorage.clear())

  it('premier lancement : rien à montrer, les notes actuelles sont notées vues', async () => {
    const { result } = renderHook(() => useNews(NOTES))
    await waitFor(() => expect(seen()).toEqual(['nouveau', 'ancien']))
    expect(result.current[0]).toEqual([])
  })

  it('utilisateur existant (ancien numéro de version) : toutes les notes `popup`', async () => {
    window.localStorage.setItem('masterscards:welcomed', '1')
    window.localStorage.setItem('masterscards:news-seen', '0.3.0')
    const { result } = renderHook(() => useNews(NOTES))
    await waitFor(() => expect(result.current[0].map((n) => n.id)).toEqual(['nouveau', 'ancien']))
  })

  it('montre les notes pas encore vues, une seule fois', async () => {
    window.localStorage.setItem('masterscards:news-seen', JSON.stringify(['ancien']))
    const { result } = renderHook(() => useNews(NOTES))
    await waitFor(() => expect(result.current[0].map((n) => n.id)).toEqual(['nouveau']))
    act(() => result.current[1]())
    expect(result.current[0]).toEqual([])
    await waitFor(() => expect(seen()).toEqual(['ancien', 'nouveau']))
  })
})
