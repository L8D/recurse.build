const debug = require('debug')('worker:users')

exports.worker = async function ({
  fero
}) {
  const users = await fero('users', (req) => {
    debug('handling message', req.key, req.value, req.peer)

    if (users.partitions.append(req)) {
      // see https://github.com/pemrouz/fero/blob/219f9c78291e4221f44b08e469d2460c59b75fc8/peers.js#L200
      users.peers.broadcast(req.buffer, users.peers.constants.commands.commit)
      return [200, 'ok']
    } else {
      return [405, 'method not allowed']
    }
  })

  return users
}

if (require.main === module) {
  (async () => {
    // TODO: setup in-house constructor
    // TODO: setup redis connector w/ redis cluster
    const fero = require('fero')

    await exports.worker({
      fero
    })
  })()
}
