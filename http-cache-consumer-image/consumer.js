const assert = require('assert')
const debug = require('debug')('consumer:http-cache')
const fero = require('fero')
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const name = process.env.TOPIC_NAME
const port = process.env.PORT

if (!name) {
  throw new Error('Must provide TOPIC_NAME')
}

if (!port) {
  throw new Error('Must provide PORT')
}

const handleReply = (ctx, reply) => {
  debug('handling reply', reply)
  // TODO: document the [status, message] response pattern
  //       in a markdown document, and reference it in
  //       header comments for utility files like this one.
  const [status, message] = reply.value

  assert(typeof status === 'number', 'service returned non-number status')
  assert(typeof message === 'string', 'service returned non-string message')

  ctx.status = status
  ctx.body = `${message}\n`
}

const makeApp = (cache) => {
  const router = new Router()
  const app = new Koa()

  router.get('/:key', (ctx) => {
    const value = cache[ctx.params.key]

    // TODO: use the short-hand (value == null) when
    //       we have linting in the project
    if (value === null || value === undefined) {
      ctx.status = 404
    } else {
      ctx.body = value
    }
  })

  router.delete('/:key', async (ctx) => {
    const reply = await cache
      .delete(ctx.params.key)
      .on('reply')

    handleReply(ctx, reply)
  })

  router.put('/:key', async (ctx) => {
    if (ctx.request.body === undefined) {
      handleReply(ctx, {
        value: [415, 'unsupported media type']
      })

      return
    }

    const reply = await cache
      .update(ctx.params.key, ctx.request.body)
      .on('reply')

    handleReply(ctx, reply)
  })

  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}

exports.makeApp = makeApp

exports.consumer = async ({
  fero
}) => {
  const cache = await fero(name, {client: true})

  const app = makeApp(cache)

  debug(`starting the server on port ${port}`)
  app.listen(port, () => {
    debug(`listening on port ${port}`)
  })
}

if (require.main === module) {
  (async () => {
    const fero = require('fero')

    await exports.consumer({
      fero
    })
  })()
}
