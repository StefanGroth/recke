const Discord = require('discord.js')
const client = new Discord.Client()

const mongoose = require('mongoose')
const uri = 'mongodb://127.0.0.1:27017/recks'
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})

const onReady = require('./onReady.js')
const onMessage = require('./onMessage.js')

let collection = undefined

let config = {
  prefix: '!reck',
  restrictedTo: new Set()
}

const auth = require('./auth.json')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  client.login(auth.token)

  const RecommendationSchema = new mongoose.Schema(
    {
      id: Number,
      tags: [String],
      recommendation : String
    }
  )  

  const MaxIdSchema = new mongoose.Schema({ value : Number })
  const MaxId = mongoose.model('MaxId', MaxIdSchema, 'MaxId')

  MaxId.findOne({}).then(
    result => {
      if(result === null) {
        MaxId.create({ value: 0 })
      }
    } 
  )
  
  const Recommendation = mongoose.model('Recommendation', RecommendationSchema, 'Recommendation')
 
  client.on('ready', () => {
  
    const result = onReady('config.json', 'data.json')
    config = result.config
    
    console.log(`Logged in as ${client.user.tag}!`)
  
  })
  
  client.on('message', (msg) => {
    config = onMessage(msg, config, Recommendation, MaxId, 'config.json', 'data.json')
  })

})

