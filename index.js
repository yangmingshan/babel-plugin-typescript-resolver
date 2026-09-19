import path from 'node:path'
import { getTsconfig, createPathsMatcher } from 'get-tsconfig'

export default function typescriptResolver({ types: t }) {
  return {
    name: 'typescript-resolver',
    visitor: {
      ImportDeclaration({ node }, { filename }) {
        if (!filename || node.source.value.startsWith('.')) return

        let tsconfig = getTsconfig(filename)
        if (!tsconfig) {
          tsconfig = getTsconfig(filename, 'jsconfig.json')
        }
        if (!tsconfig) return

        const pathsMatcher = createPathsMatcher(tsconfig)
        if (!pathsMatcher) return

        const paths = pathsMatcher(node.source.value)
        if (paths.length !== 1) return

        let relativePath = path
          .relative(path.dirname(filename), paths[0])
          .replaceAll('\\', '/')
        if (relativePath === '') {
          relativePath = '.'
        } else if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`
        }
        node.source = t.stringLiteral(relativePath)
      },
      CallExpression({ node }, { filename }) {
        if (
          !filename ||
          node.callee.name !== 'require' ||
          !t.isStringLiteral(node.arguments[0]) ||
          node.arguments[0].value.startsWith('.')
        ) {
          return
        }

        let tsconfig = getTsconfig(filename)
        if (!tsconfig) {
          tsconfig = getTsconfig(filename, 'jsconfig.json')
        }
        if (!tsconfig) return

        const pathsMatcher = createPathsMatcher(tsconfig)
        if (!pathsMatcher) return

        const paths = pathsMatcher(node.arguments[0].value)
        if (paths.length !== 1) return

        let relativePath = path
          .relative(path.dirname(filename), paths[0])
          .replaceAll('\\', '/')
        if (relativePath === '') {
          relativePath = '.'
        } else if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`
        }
        node.arguments[0] = t.stringLiteral(relativePath)
      },
    },
  }
}
