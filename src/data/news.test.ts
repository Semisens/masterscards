import { describe, expect, it } from 'vitest'
import { getGame } from './games.ts'
import {
  compareVersions,
  MAX_PENDING,
  NEXT_VERSION,
  newsNotes,
  pendingNotes,
  publishedNotes,
  type NewsNote,
} from './news.ts'

const note = (version: string): NewsNote => ({ version, title: `Titre ${version}`, text: 'Texte.' })

describe('compareVersions', () => {
  it('compare les nombres, pas le texte', () => {
    expect(compareVersions('0.10.0', '0.9.0')).toBeGreaterThan(0)
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
    expect(compareVersions('0.2.1', '0.3.0')).toBeLessThan(0)
  })
})

describe('pendingNotes', () => {
  const notes = [note('0.5.0'), note('0.3.0'), note('0.2.0')]

  it('garde les notes plus récentes que la dernière vue, jusqu’à la version en cours', () => {
    expect(pendingNotes(notes, '0.4.2', '0.2.0').map((n) => n.version)).toEqual(['0.3.0'])
    expect(pendingNotes(notes, '0.5.0', '0.1.0').map((n) => n.version)).toEqual(['0.5.0', '0.3.0', '0.2.0'])
  })

  it('ne montre rien si tout est vu, ou pour une version sans note', () => {
    expect(pendingNotes(notes, '0.5.0', '0.5.0')).toEqual([])
    expect(pendingNotes(notes, '0.3.1', '0.3.0')).toEqual([])
  })

  it('compte une note « prochaine » dans la version en cours', () => {
    expect(pendingNotes([note(NEXT_VERSION), ...notes], '0.5.1', '0.5.0').map((n) => n.version)).toEqual(['0.5.1'])
  })

  it(`montre ${MAX_PENDING} notes au plus, les plus récentes`, () => {
    const many = Array.from({ length: 8 }, (_, i) => note(`0.${8 - i}.0`))
    const shown = pendingNotes(many, '1.0.0', '0.0.0')
    expect(shown).toHaveLength(MAX_PENDING)
    expect(shown[0].version).toBe('0.8.0')
  })
})

describe('publishedNotes', () => {
  it('ignore les notes d’une version pas encore sortie', () => {
    expect(publishedNotes([note('0.4.0'), note('0.2.0')], '0.3.0').map((n) => n.version)).toEqual(['0.2.0'])
  })
})

describe('src/content/changelog.yaml', () => {
  it('est une liste', () => {
    expect(Array.isArray(newsNotes)).toBe(true)
  })

  for (const [index, entry] of newsNotes.entries()) {
    describe(`note ${index + 1} (${String(entry.version)})`, () => {
      it('a une version x.y.z ou « prochaine »', () => {
        expect(typeof entry.version).toBe('string')
        expect(entry.version === NEXT_VERSION || /^\d+\.\d+\.\d+$/.test(entry.version)).toBe(true)
      })

      it('a un titre et un texte', () => {
        expect(typeof entry.title).toBe('string')
        expect(entry.title.trim()).not.toBe('')
        expect(typeof entry.text).toBe('string')
        expect(entry.text.trim()).not.toBe('')
      })

      it('n’a que des puces non vides', () => {
        if (entry.items === undefined) return
        expect(Array.isArray(entry.items)).toBe(true)
        for (const item of entry.items) expect(typeof item === 'string' && item.trim() !== '').toBe(true)
      })

      it('montre un jeu qui existe', () => {
        if (entry.game === undefined) return
        expect(getGame(entry.game)).toBeDefined()
      })

      it('n’a que des champs connus', () => {
        expect(
          Object.keys(entry).filter((key) => !['version', 'title', 'text', 'items', 'game'].includes(key)),
        ).toEqual([])
      })
    })
  }

  it('a des versions uniques, de la plus récente à la plus ancienne', () => {
    const versions = newsNotes.map((n) => n.version)
    expect(new Set(versions).size).toBe(versions.length)
    expect(versions.filter((v) => v === NEXT_VERSION).length).toBeLessThanOrEqual(1)
    if (versions.includes(NEXT_VERSION)) expect(versions[0]).toBe(NEXT_VERSION)
    const numbered = versions.filter((v) => v !== NEXT_VERSION)
    expect(numbered).toEqual([...numbered].sort((a, b) => compareVersions(b, a)))
  })
})
