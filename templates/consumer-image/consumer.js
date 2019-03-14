const debug = require('debug')('consumer:<%= name %>')

exports.consumer = async ({
  fero,
  db
}) => {
  // TODO: replace topic name
  const foo = await fero('foo', {client: true})

  foo
    .on('change')
    .map(({key, value}) => {
      db[key] = value
    })
}

if (require.main === module) {
  (async () => {
    const fero = require('fero')

    await exports.consumer({
      fero,
      db: {}
    })
  })()
}
