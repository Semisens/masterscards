import { describe, expect, it } from 'vitest'
import { stampChangelog } from './stamp-changelog.ts'

describe('stampChangelog', () => {
  it('écrit le numéro à la place de « prochaine »', () => {
    const text = "- version: prochaine\n  title: Nouveau\n- version: '0.2.0'\n  title: Ancien\n"
    expect(stampChangelog(text, '0.3.0')).toBe(
      "- version: '0.3.0'\n  title: Nouveau\n- version: '0.2.0'\n  title: Ancien\n",
    )
  })

  it('garde un commentaire en bout de ligne et accepte les apostrophes', () => {
    expect(stampChangelog("- version: 'prochaine' # à publier\n", '1.0.0')).toBe("- version: '1.0.0' # à publier\n")
  })

  it('ne change rien sans note à publier', () => {
    const text = "- version: '0.2.0'\n  text: La prochaine fois.\n"
    expect(stampChangelog(text, '0.3.0')).toBe(text)
  })
})
