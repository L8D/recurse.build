/* globals describe, it, expect */

const {consumer} = require('../consumer')

const emitterify = require('utilise.emitterify')

const makeMemoryTopicPool = () => new Proxy({}, {
  get: (target, key) => {
    if (key in target) {
      return target[key]
    } else {
      return target[key] = emitterify()
    }
  }
})

describe('http-cache-consumer', () => {
  it('should consume messages', async () => {
    const topics = makeMemoryTopicPool()
    const db = {}

    await consumer({
      fero: (name) => topics[name],
      db
    })

    topics['foo'].emit('change', {key: 'bar', value: 'baz'})

    expect(db.bar).toBe('baz')
  })
})
