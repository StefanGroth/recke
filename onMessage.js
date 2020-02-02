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

var commandRegister = new Map()
commandRegister.set('help', HelpCommand)
commandRegister.set('add', AddCommand)
commandRegister.set('recommend', RecommendCommand)
commandRegister.set('change', ChangeCommand)
commandRegister.set('remove', RemoveCommand)
commandRegister.set('not-found', NotFoundCommand)
commandRegister.set('list', ListCommand)
commandRegister.set('role', RoleCommand)

function createJSON(recommendations) {
  return JSON.stringify({
    currentID: recommendations.currentID,
    values: [...recommendations.values],
    tags: [...recommendations.tags]
  }, null, 1)
}

function onMessage(msg, config, recommendations, configPath, dataPath) {

  const prefix = config.prefix

  if (msg.channel.guild === undefined) {
    return
  }

  if (!msg.content.startsWith(prefix)) {
    return
  }

  if (
    !msg.member.hasPermission('ADMINISTRATOR') && !msg.member.roles.some(role => config.restrictedTo.has(role.name)) 
  ) {
    msg.reply('You do not have the necessary permissions to use this bot.')
    return
  }

  const content = msg.content.substr(prefix.length, msg.content.length - prefix.length)

  var result = { command: 'not-found' }
  try {
    result = parser.parse(content)
  }
  catch (error) {
    result = { command: 'not-found', error }
  }

  var context = {
    config,
    recommendations,
    result,
  }
  
  try {
    var { saveRecs, saveConfig, reply } = commandRegister.get(result.command)(context)
  
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