const trimChunkName = baseDir => {
  let chunkName = baseDir.replace(/^[./]+|(\.js$)/g, '')
  chunkName = chunkName.replace(/^(@\/)/, '')
  chunkName = chunkName.replace(/\//g, '_')
  return chunkName
}

function hasMagicComment(node) {
  const {leadingComments} = node
  return leadingComments && leadingComments.length > 0 && leadingComments[0].value.indexOf('webpackChunkName') >= 0
}

function getMagicCommentChunkName(importArgNode) {
  const {quasis, expressions} = importArgNode

  if (!quasis) {
    return trimChunkName(importArgNode.value)
  }

  const baseDir = quasis[0].value.cooked
  const hasExpressions = expressions.length > 0
  const baseDirEx = baseDir.replace(/\/\//g, '\/').replace(/^(@\/)/, '');
  const chunkName = baseDirEx + (hasExpressions ? '[request]' : '')
  if (baseDirEx == "customized/") return chunkName
  else return trimChunkName(chunkName)
}

module.exports = function () {
  return {
    name: 'webpack-chunkname',

    visitor: {
      CallExpression(path) {
        if (path.node.callee.type === 'Import') {
          const arg = path.get('arguments')[0]
          if (hasMagicComment(arg.node)) return

          arg.addComment('leading', ` webpackChunkName: '${getMagicCommentChunkName(arg.node)}' `)
        }
      }
    }
  }
}
