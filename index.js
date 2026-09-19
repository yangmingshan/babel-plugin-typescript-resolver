import path from 'node:path'
import { getTsconfig, createPathsMatcher } from 'get-tsconfig'

function isAncestor(value) {
  return value === '..' || value.startsWith('../')
}

function isRelative(value) {
  return value === '.' || value.startsWith('./') || isAncestor(value)
}

export default function typescriptResolver({ types: t }) {
  return {
    name: 'typescript-resolver',
    visitor: {
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration|ImportExpression'(
        { node },
        { filename },
      ) {
        if (
          !filename ||
          !t.isStringLiteral(node.source) ||
          isRelative(node.source.value)
        ) {
          return
        }

        let tsconfig = getTsconfig(filename)
        if (!tsconfig) {
          tsconfig = getTsconfig(filename, 'jsconfig.json')
        }
        if (
          !tsconfig ||
          tsconfig.config.compilerOptions?.baseUrl !== undefined
        ) {
          return
        }

        const pathsMatcher = createPathsMatcher(tsconfig)
        if (!pathsMatcher) return

        const paths = pathsMatcher(node.source.value)
        if (paths.length !== 1) return

        let relativePath = path
          .relative(path.dirname(filename), paths[0])
          .replaceAll('\\', '/')
        if (relativePath === '') {
          relativePath = '.'
        } else if (!isAncestor(relativePath)) {
          relativePath = `./${relativePath}`
        }
        node.source = t.inheritsComments(
          t.stringLiteral(relativePath),
          node.source,
        )
      },
      CallExpression({ node }, { filename }) {
        if (
          !filename ||
          node.callee.name !== 'require' ||
          !t.isStringLiteral(node.arguments[0]) ||
          isRelative(node.arguments[0].value)
        ) {
          return
        }

        let tsconfig = getTsconfig(filename)
        if (!tsconfig) {
          tsconfig = getTsconfig(filename, 'jsconfig.json')
        }
        if (
          !tsconfig ||
          tsconfig.config.compilerOptions?.baseUrl !== undefined
        ) {
          return
        }

        const pathsMatcher = createPathsMatcher(tsconfig)
        if (!pathsMatcher) return

        const paths = pathsMatcher(node.arguments[0].value)
        if (paths.length !== 1) return

        let relativePath = path
          .relative(path.dirname(filename), paths[0])
          .replaceAll('\\', '/')
        if (relativePath === '') {
          relativePath = '.'
        } else if (!isAncestor(relativePath)) {
          relativePath = `./${relativePath}`
        }
        node.arguments[0] = t.inheritsComments(
          t.stringLiteral(relativePath),
          node.arguments[0],
        )
      },
    },
  }
}
