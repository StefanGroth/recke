const Discord = require('discord.js')
const client = new Discord.Client()

const onReady = require('./onReady.js')
const onMessage = require('./onMessage.js')
const backup = require('./utility/backup')

var config = undefined
var recommendations = undefined

client.on('ready', () => {

  const configPath = 'config.json'
  const dataPath = 'data.json'

  backup(configPath)
  backup(dataPath)

  const result = onReady(configPath, dataPath)
  config = result.config
  recommendations = result.recommendations

  console.log(`Logged in as ${client.user.tag}!`)

})

client.on('message', (msg) => {

  onMessage(msg, config, recommendations, 'config.json', 'data.json')

})

const auth = require('./auth.json')

client.login(auth.token)
