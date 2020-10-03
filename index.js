const Discord = require('discord.js')
const client = new Discord.Client()

const onReady = require('./onReady.js')
const onMessage = require('./onMessage.js')

let config = {
  prefix: '!reck',
  restrictedTo: new Set()
}

let recommendations = {
  currentID: 0,
  values: new Discord.Collection(),
  tags: new Set()
}

client.on('ready', () => {

  const result = onReady('config.json', 'data.json')
  config = result.config
  recommendations = result.recommendations

  console.log(`Logged in as ${client.user.tag}!`)

})

client.on('message', (msg) => {

  const result = onMessage(msg, config, recommendations, 'config.json', 'data.json')
  config = result.config
  recommendations = result.recommendations

})

const auth = require('./auth.json')

client.login(auth.token)
