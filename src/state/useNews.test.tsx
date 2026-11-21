import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { NewsNote } from '../data/news.ts'
import { useNews } from './useNews.ts'

const NOTES: NewsNote[] = [
  { version: '0.3.0', title: 'Nouveau', text: 'Texte.' },
  { version: '0.2.0', title: 'Ancien', text: 'Texte.' },
]
const seen = () => window.localStorage.getItem('masterscards:news-seen')

describe('useNews', () => {
  beforeEach(() => window.localStorage.clear())

  it('premier lancement : rien à montrer, la version en cours est notée vue', async () => {
    const { result } = renderHook(() => useNews(NOTES, '0.3.0'))
    await waitFor(() => expect(seen()).toBe('0.3.0'))
    expect(result.current[0]).toEqual([])
  })

  it('utilisateur d’avant cette fonction : toutes les notes en attente', async () => {
    window.localStorage.setItem('masterscards:welcomed', '1')
    const { result } = renderHook(() => useNews(NOTES, '0.3.0'))
    await waitFor(() => expect(result.current[0].map((n) => n.version)).toEqual(['0.3.0', '0.2.0']))
  })

  it('montre les notes plus récentes que la dernière vue, puis les marque vues', async () => {
    window.localStorage.setItem('masterscards:news-seen', '0.2.0')
    const { result } = renderHook(() => useNews(NOTES, '0.3.1'))
    await waitFor(() => expect(result.current[0].map((n) => n.version)).toEqual(['0.3.0']))
    act(() => result.current[1]())
    expect(result.current[0]).toEqual([])
    await waitFor(() => expect(seen()).toBe('0.3.1'))
  })
})
