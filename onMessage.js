const fs = require('fs')
const parser = require('./command-parser')
const Discord = require('discord.js')

const HelpCommand = require('./commands/Help')
const AddCommand = require('./commands/Add')
const RecommendCommand = require('./commands/Recommend')
const ChangeCommand = require('./commands/Change')
const RemoveCommand = require('./commands/Remove')
const ListCommand = require('./commands/List')
const NotFoundCommand = require('./commands/NotFound')
const RoleCommand = require('./commands/Role')

const recommendationEmbed = require('./utility/RecommendationEmbed')

function createJSON(recommendations) {
  return JSON.stringify({
    currentID: recommendations.currentID,
    values: [...recommendations.values],
    tags: [...recommendations.tags]
  }, null, 1)
}

class CommandRegister {

  constructor() {
    this.functions = new Map();
  }

  add(tag, func) {
    this.functions.set(tag, func)
  }

  dispatch(tag) {
    return this.functions.get(tag)
  }

}

function onMessage(msg, config, recommendations, configPath, dataPath) {

  const prefix = config.prefix

  if (!msg.content.startsWith(prefix)) {
    return { config, recommendations }
  }

  if (
    !(msg.channel instanceof Discord.DMChannel) &&
    !msg.member.hasPermission('ADMINISTRATOR') &&
    !msg.member.roles.some(role => config.restrictedTo.has(role.name))
  ) {

    msg.reply('You do not have the necessary permissions to use this bot.')
    return { config, recommendations }
  }

  const content = msg.content.substr(prefix.length, msg.content.length - prefix.length)

  var result = { command: 'not-found' }
  try {
    result = parser.parse(content)
  }
  catch (error) {
    result = { command: 'not-found', error }
  }

  var register = new CommandRegister()
  register.add('help', HelpCommand)
  register.add('add', AddCommand)
  register.add('recommend', RecommendCommand)
  register.add('change', ChangeCommand)
  register.add('remove', RemoveCommand)
  register.add('not-found', NotFoundCommand)
  register.add('list', ListCommand)
  register.add('role', RoleCommand)

  var context = {
    config,
    recommendations,
    result,
  }
  
  try {
    var { saveRecs, saveConfig, reply } = register.dispatch(result.command)(context)
  
    if (saveRecs != undefined) {
      const changedJson = createJSON(recommendations)
      fs.writeFileSync(dataPath, changedJson)
    }
    if (saveConfig != undefined) {
      const configJson = JSON.stringify({ prefix: config.prefix, restrictedTo: [...config.restrictedTo] })
      fs.writeFileSync(configPath, configJson)
    }

    reply(msg)

  }
  catch(error) {
    throw 'Unexpected Parser Result: ' + error
  }

  return { config, recommendations }

}

module.exports = onMessage