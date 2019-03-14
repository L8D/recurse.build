/* globals describe, it, expect */

const emitterify = require('utilise.emitterify')

const {consumer} = require('../consumer')

const makeMemoryTopicPool = () => new Proxy({}, {
  get: (target, key) => {
    if (key in target) {
      return target[key]
    } else {
      return target[key] = emitterify()
    }
  }
})

describe('users-authorized-keys-fs-consumer', () => {
  it('report a complete job history when the user exists', async () => {
    const topics = makeMemoryTopicPool()

    const props = {
      fero: async (name) => topics[name],
      sh: jest.fn((...args) => ({sh: args})),
      fs: {
        writeFile: jest.fn((...args) => ({writeFile: args}))
      }
    }

    const sinks = await consumer(props)
      
    topics.users.emit('change', {
      key: 'foo',
      value: {authorized_keys: 'baz'}
    })

    sinks.create.stop()

    const output = await sinks.create

    expect(output).toMatchSnapshot()
  })

  it('report a complete job history when the user does not exist', async () => {
    const topics = makeMemoryTopicPool()

    const props = {
      fero: async (name) => topics[name],
      sh: jest.fn((...args) => {
        if (/^id /.test(args[0])) {
          throw new Error('user does not exist')
        }

        return {sh: args}
      }),
      fs: {
        writeFile: jest.fn((...args) => ({writeFile: args}))
      }
    }

    const sinks = await consumer(props)
      
    topics.users.emit('change', {
      key: 'foo',
      value: {authorized_keys: 'baz'}
    })

    sinks.create.stop()

    const output = await sinks.create

    expect(output).toMatchSnapshot()
  })
})
