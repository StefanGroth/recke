const fs = require('fs')
const Discord = require('discord.js')

function onReady(configPath, dataPath) {

  var config = undefined;
  try {
    const { prefix, restrictedTo } = JSON.parse(fs.readFileSync(configPath))
    config = {
      prefix,
      restrictedTo : new Set(restrictedTo)
    }
  }
  catch(error) {
    throw error
  }

  var recommendations = {
    currentID: 0,
    values: new Discord.Collection(),
    tags: new Set()
  }

  try {
    const readData = fs.readFileSync(dataPath)
    try {
      const recommendationsFromFile = JSON.parse(readData)
      recommendations.currentID = recommendationsFromFile.currentID
      recommendations.values = new Discord.Collection(recommendationsFromFile.values)
      recommendations.tags = new Set(recommendationsFromFile.tags)
    }
    catch (error) {

      const errorData = fs.readFileSync(dataPath)
      fs.writeFileSync(`${dataPath}_errorData_` + Date.now(), errorData)

      console.log(`Could not parse ${dataPath}, Continuing with empty recommendations.`)
    }
  }
  catch(error) {
    console.log(`No file ${dataPath}, continuing with empty recommendations.`)
  }

  return { config, recommendations }
}

module.exports = onReady