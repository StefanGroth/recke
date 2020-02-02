const fs = require('fs')
const Discord = require('discord.js')

function onReady(configPath, dataPath) {

  const configFile = fs.readFileSync(configPath)

  const { prefix, restrictedTo } = JSON.parse(configFile)
  var config = {
    prefix : prefix,
    restrictedTo : new Set(restrictedTo)
  }

  const dataFile = fs.readFileSync(dataPath)

  const { currentID, values, tags } = JSON.parse(dataFile) 
  var recommendations = {
    currentID : currentID,
    values : new Discord.Collection(values),
    tags : new Set(tags)
  }

  return { config, recommendations }
}

module.exports = onReady