const debug = require('debug')('consumer:users-authorized-keys')
const k8s = require('@kubernetes/client-node')
const {Readable} = require('stream')

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const exec = new k8s.Exec(kc);

const namespace = process.env.POD_NAMESPACE

if (!namespace) {
  throw new Error('Must provide POD_NAMESPACE')
}

const podName = process.env.POD_NAME

if (!podName) {
  throw new Error('Must provide POD_NAME')
}

const siblingName = process.env.SIBLING_CONTAINER_NAME

if (!siblingName) {
  throw new Error('Must provide SIBLING_CONTAINER_NAME')
}

const stdout = process.stdout
const stderr = process.stderr
const tty = false

async function containerExec(command) {
  const socket = await exec.exec(
    namespace, podName, siblingName, command,
    stdout,
    stderr,
    null,
    tty,
    (status) => debug('got status', status)
  )

  return socket 
}

exports.consumer = async ({
  fero,
  db
}) => {
  const users = await fero('users', {client: true})

  users
    .on('change')
    .map(async ({key: name, value: user}) => {
      debug('creating user', name, user)
      try { 
        const socket = await containerExec(['./add-user.sh', name, user.authorized_keys])

        socket.on('open', () => {
          debug('socket opened', name)
        })

        socket.on('message', (data, ...args) => {
          debug('socket got data', name, data.toString())
        })

        socket.on('close', () => {
          debug('socket closed', name)
        })
      } catch (error) {
        debug('caught error when trying to exec', error, error.message, error.name)
      }
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
