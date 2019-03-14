const debug = require('debug')('consumer:users-authorized-keys-fs')

exports.consumer = async ({
  fero,
  sh,
  fs
}) => {
  const users = await fero('users', {client: true})

  // TODO: this is an attack vector.
  //       users could supply malicious usernames
  //       and inject shell a shell script here.

  const exists = async (username) => {
    try {
      await sh(`id -u ${username}`)
      return true
    } catch (_) {
      return false
    }
  }

  const addUser = async (username) => [
    // -D ensures we don't supply a password here
    await sh(`adduser -D ${username}`),

    // -ud enables the account for signin
    //     while not suppyling a password
    await sh(`passwd ${username} -ud`)
  ]

  const persistAuthorizedKeys = async (username, authorized_keys) => [
    await sh(`mkdir -p -m 0755 /etc/ssh/authorized-keys`),

    await fs.writeFile(
      `/etc/ssh/authorized-keys/${username}`,
      authorized_keys,
      {mode: 0o755}
    ),

    await sh(`mkdir -p -m 0700 /home/${username}/.ssh`),

    await fs.writeFile(
      `/home/${username}/.ssh/authorized_keys`,
      authorized_keys,
      {mode: 0o600}
    ),

    await sh(`chown -R ${username} /home/${username}/.ssh`)
  ]

  const create = async ({
    key: username,
    value: {authorized_keys = ''} = null
  }) => [
    await exists(username) || await addUser(username),

    await persistAuthorizedKeys(username, authorized_keys)
  ]

  return {
    create: users.on('change').map(create)
  }
}

/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const fero = require('fero')
    const cp = require('mz/child_process')
    const fs = require('mz/fs')

    const {create} = await exports.consumer({
      fero,

      fs: {
        async writeFile(...args) {
          return {
            writeFile: args,
            result: await fs.writeFile(...args)
          }
        }
      },

      async sh (command) {
        return {
          sh: command,
          result: await cp.exec(command, {shell: true, stdio: 'inherit'})
        }
      }
    })

    create.map(async (promise) => {
      try {
        console.log(JSON.stringify(await promise))
      } catch (error) {
        console.log(JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        }))
      }
    })
  })()
}
