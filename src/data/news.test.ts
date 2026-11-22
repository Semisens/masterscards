import { describe, expect, it } from 'vitest'
import { getGame } from './games.ts'
import { listedNotes, MAX_PENDING, newsNotes, parseSeen, pendingNotes, type NewsNote } from './news.ts'

const note = (id: string, popup = true, listed = true): NewsNote => ({ id, popup, listed, title: id, text: 'Texte.' })

describe('pendingNotes', () => {
  const notes = [note('c'), note('b', false), note('a')]

  it('garde les notes `popup` pas encore vues, dans l’ordre du fichier', () => {
    expect(pendingNotes(notes, []).map((n) => n.id)).toEqual(['c', 'a'])
    expect(pendingNotes(notes, ['c']).map((n) => n.id)).toEqual(['a'])
  })

  it('ne montre rien quand tout est vu', () => {
    expect(pendingNotes(notes, ['a', 'c'])).toEqual([])
  })

  it(`montre ${MAX_PENDING} notes au plus, les plus récentes`, () => {
    const many = Array.from({ length: 8 }, (_, i) => note(`n${i}`))
    const shown = pendingNotes(many, [])
    expect(shown).toHaveLength(MAX_PENDING)
    expect(shown[0].id).toBe('n0')
  })
})

describe('listedNotes', () => {
  it('garde les notes `listed`, dans l’ordre du fichier', () => {
    expect(listedNotes([note('c'), note('b', true, false), note('a', false)]).map((n) => n.id)).toEqual(['c', 'a'])
  })
})

describe('parseSeen', () => {
  it('relit une liste JSON d’identifiants', () => {
    expect(parseSeen('["a","b"]')).toEqual(['a', 'b'])
  })

  it('ignore une valeur absente ou ancienne (un numéro de version)', () => {
    expect(parseSeen(null)).toEqual([])
    expect(parseSeen('0.3.0')).toEqual([])
    expect(parseSeen('{"a":1}')).toEqual([])
  })
})

describe('src/content/changelog.yaml', () => {
  it('est une liste', () => {
    expect(Array.isArray(newsNotes)).toBe(true)
  })

  for (const [index, entry] of newsNotes.entries()) {
    describe(`note ${index + 1} (${String(entry.id)})`, () => {
      it('a un identifiant en minuscules et tirets', () => {
        expect(typeof entry.id).toBe('string')
        expect(entry.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      })

      it('dit si elle s’affiche au lancement (`popup`) et dans les réglages (`listed`)', () => {
        expect(typeof entry.popup).toBe('boolean')
        expect(typeof entry.listed).toBe('boolean')
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
        const known = ['id', 'popup', 'listed', 'title', 'text', 'items', 'game']
        expect(Object.keys(entry).filter((key) => !known.includes(key))).toEqual([])
      })
    })
  }

  it('a des identifiants uniques', () => {
    const ids = newsNotes.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
