// Écrit le numéro de la version dans les notes de nouveautés encore marquées `version: prochaine`.
// Lancé par `npm version` (script de cycle de vie « version » de package.json), avant son commit :
// le fichier tamponné part dans le même commit « Version x.y.z », sous la même étiquette.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const NEXT_VERSION = 'prochaine'

const NEXT_LINE = new RegExp(`^(\\s*-?\\s*version:\\s*)['"]?${NEXT_VERSION}['"]?(\\s*(?:#.*)?)$`, 'gm')

/** Remplace `version: prochaine` par `version: 'x.y.z'`, sans toucher au reste du fichier. */
export function stampChangelog(text: string, version: string): string {
  return text.replace(NEXT_LINE, `$1'${version}'$2`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const version = process.env.npm_package_version
  if (!version) {
    console.error('stamp-changelog : à lancer par `npm version` (npm_package_version absent).')
    process.exit(1)
  }
  const file = new URL('../src/content/changelog.yaml', import.meta.url)
  const before = readFileSync(file, 'utf8')
  const after = stampChangelog(before, version)
  if (after !== before) {
    writeFileSync(file, after)
    console.log(`Nouveautés : « ${NEXT_VERSION} » devient ${version}.`)
  }
}
