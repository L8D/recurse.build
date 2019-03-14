/* globals describe, it, expect */

const path = require('path')
const fero = require('fero')
const compose = require('docker-compose')

jest.setTimeout(30 * 1000)

const TAG = process.env.TAG || 'latest'

describe('users-authorized-keys-fs-consumer-image', () => {
  it('should build', async () => {
    const options = {cwd: path.join(__dirname), log: true}

    try {
      await compose.upAll(options)

      await compose.logs('consumer', {...options, follow: true})

      await compose.exec(
        'worker',
        '/app/node_modules/.bin/fero set users tenor.authorized_keys foo',
        options
      )

      await new Promise((r) => setTimeout(r, 5000))

      const result = await compose.exec(
        'consumer',
        'ls /home',
        options
      )

      console.log(result)
      // console.log(await compose.logs('consumer', options))
    } finally {
      await compose.down(options)
    }
  })
})

/*
    let container
    let users
      //users = await fero('users')

      //users.update('tenor', {username: 'tenor', authorized_keys: 'foo'})

      container = await docker.createContainer({
        Image: `users-authorized-keys-fs-consumer:${TAG}`,
        Cmd: ['node', '-e', "require('fero')('users')"]
      })

      await container.start()

      const consumerExec = await container.exec({
        Cmd: ["node", "consumer"],
        Env: ["DEBUG=*"]
      })

      const consumerStream = await consumerExec.start({hijack: true})

      docker.modem.demuxStream(consumerStream.output, process.stdout, process.stderr)

      const injection = await container.exec({
        Cmd: '/app/node_modules/.bin/fero set users tenor.authorized_keys foo'
          .split(' ')
      })
  
      const {output: injectionStream} = await injection.start()

      const result = await new Promise((resolve, reject) => {
        docker.modem.followProgress(
          injectionStream,
          (err, output) => err ? reject(err) : resolve(output),
          (event) => console.log('injection', event)
        )
      })

      // await new Promise((r) => setTimeout(r, 5000))
      // const result = await new Promise((resolve, reject) => {
      //   consumerStream.on('close', resolve)
      //   consumerStream.on('error', reject)
      // })

      const exec = await container.exec({
        Cmd: ['cat', '/etc/ssh/authorized-keys/tenor']
      })

      const stream = await exec.start()

      const output = await new Promise((resolve, reject) => {
        docker.modem.followProgress(
          stream.output,
          (err, output) => err ? reject(err) : resolve(output),
          (event) => console.log(event)
        )
      })

      console.log('got output', output)
    } finally {
      if (container) {
        await container.stop()
      }

      if (users) {
        await users.destroy()
      }
    }
  })
})
*/
