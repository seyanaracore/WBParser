import chalk from 'chalk'
import log from './logWriter.js'

export const errorNotify = (...content) => {
  if (!content) return

  log('[error]: ' + content.join(' '), false)
  console.log(
    content.map(str => (typeof str === 'number' ? chalk.blue(str) : chalk.red(str))).join(' ')
  )
}
export const successNotify = (...content) => {
  if (!content) return

  log('[notify]: ' + content.join(' '), true)
  console.log(
    content
      .map(str => (typeof str === 'number' ? chalk.green(str) : chalk.blueBright(str)))
      .join(' ')
  )
}
