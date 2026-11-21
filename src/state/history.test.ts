import { describe, expect, it } from 'vitest'
import { MAX_HISTORY, parseHistory, summary, withEntry, type HistoryEntry } from './history.ts'

const entry = (id: string, partial: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id,
  gameId: 'love-letter',
  date: '2026-10-12T18:00:00.000Z',
  status: 'finished',
  players: [
    { name: 'Léa', score: 4 },
    { name: 'Tom', score: 2 },
  ],
  ...partial,
})

describe('parseHistory', () => {
  it('relit une liste valide', () => {
    expect(parseHistory(JSON.stringify([entry('1'), entry('2')]))).toEqual([entry('1'), entry('2')])
  })

  it.each([
    ['sans donnée', null],
    ['vide', ''],
    ['pas du JSON', '{oups'],
    ['pas une liste', '{"a":1}'],
  ])('renvoie une liste vide : %s', (_label, raw) => {
    expect(parseHistory(raw)).toEqual([])
  })

  it('ignore seulement les entrées abîmées', () => {
    const bad = [
      { ...entry('x'), status: 'perdue' },
      { ...entry('x'), date: 'hier' },
      { ...entry('x'), players: [] },
      { ...entry('x'), players: [{ name: '', score: 1 }] },
      { ...entry('x'), players: [{ name: 'A', score: -1 }] },
      null,
    ]
    expect(parseHistory(JSON.stringify([entry('1'), ...bad, entry('2')]))).toEqual([entry('1'), entry('2')])
  })
})

describe('withEntry', () => {
  it('met la partie la plus récente en tête', () => {
    expect(withEntry([entry('1')], entry('2')).map((e) => e.id)).toEqual(['2', '1'])
  })

  it('n’enregistre pas deux fois la même partie', () => {
    expect(withEntry([entry('1')], entry('1', { status: 'interrupted' }))).toEqual([
      entry('1', { status: 'interrupted' }),
    ])
  })

  it('garde seulement les parties les plus récentes', () => {
    const many = Array.from({ length: MAX_HISTORY }, (_, i) => entry(String(i)))
    const next = withEntry(many, entry('new'))
    expect(next).toHaveLength(MAX_HISTORY)
    expect(next[0].id).toBe('new')
    expect(next.at(-1)!.id).toBe(String(MAX_HISTORY - 2))
  })
})

describe('summary', () => {
  it('résume avec les deux meilleurs, du plus fort au plus faible', () => {
    expect(
      summary(
        entry('1', {
          players: [
            { name: 'Tom', score: 2 },
            { name: 'Léa', score: 4 },
            { name: 'Inès', score: 3 },
          ],
        }),
      ),
    ).toBe('Léa 4 · Inès 3')
  })

  it('résume avec les deux plus petits scores quand le plus petit gagne', () => {
    const players = [
      { name: 'Tom', score: 66 },
      { name: 'Léa', score: 12 },
      { name: 'Inès', score: 30 },
    ]
    expect(summary(entry('1', { gameId: '6-qui-prend', players }), true)).toBe('Léa 12 · Inès 30')
  })
})
