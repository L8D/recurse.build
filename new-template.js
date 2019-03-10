const path = require('path')
const program = require('commander')

const processCommand = process.argv.slice(0, 2).join(' ')

program
  .version(require('./package').version)
  .usage('<type> <name>')
  .description('create a new npm package from the specified template type')
  .action(async (type, name) => {
    const go = require('go')
    const {TemplatesPlugin} = require('go-plugin-templates')
    go.use(TemplatesPlugin)

    const search = {
      pattern: ['**'],
      cwd: path.resolve(__dirname, `templates/${type}`)
    }

    const options = {
      resolve: `${path.join(__dirname, `${name}-${type}`)}/`
    }

    const context = {
      type,
      name
    }

    const ts = await go.loadTemplates(search, options)

    await ts.write(context)
    console.log('created')
  }).on('--help', function() {
    console.log()
    console.log('Examples:')
    console.log()
    console.log('  # creates ./repos-fs-consumer-image ')
    console.log(`  $ ${processCommand} consumer-image repos-fs`)
    console.log()
    console.log('  # creates ./users-worker-image ')
    console.log(`  $ ${processCommand} worker-image users`)
  });

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
