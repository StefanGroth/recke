const Discord = require('discord.js')
const fs = require('fs')
const client = new Discord.Client()
const parser = require('./command-parser.js')

var config = {
  prefix: '!reck',
  restrictedTo: new Set()
}

var recommendations = {
  currentID: 0,
  values: new Discord.Collection(),
  tags: new Set()
}

client.on('ready', () => {

  const readConfig = JSON.parse(fs.readFileSync('config.json'))
  config = {
    prefix : readConfig.prefix,
    restrictedTo : new Set(readConfig.restrictedTo)
  }

  try {
    const readData = fs.readFileSync('data.json')
    try {
      const recommendationsFromFile = JSON.parse(readData)
      recommendations.currentID = recommendationsFromFile.currentID
      recommendations.values = new Discord.Collection(recommendationsFromFile.values)
      recommendations.tags = new Set(recommendationsFromFile.tags)
    }
    catch (error) {
      console.log(error)

      const errorData = fs.readFileSync('data.json')
      fs.writeFileSync('errorData_' + Date.now(), errorData)

      console.log('Continuing with empty recommendations.')
    }
  }
  catch(error) {
    console.log('No file data.json, continuing with recommendations.')
  }

  console.log(`Logged in as ${client.user.tag}!`)
})

function recommendationEmbed(id, recommendation) {
  return {
    description: `**ID:** ${id}\n **Tags:** [` + recommendation.tags.join(', ') + `]\n**Recommendation:**\n ${recommendation.recommendation}`
  }
}

function createJSON() {
  return JSON.stringify({
    currentID: recommendations.currentID,
    values: [...recommendations.values],
    tags: [...recommendations.tags]
  }, null, 1)
}

client.on('message', msg => {

  const prefix = config.prefix + ' '

  if (!msg.content.startsWith(prefix)) {
    return
  }

  if (
    msg.channel.guild === null &&
    !msg.member.hasPermission('ADMINISTRATOR') &&
    !msg.member.roles.some(role => config.restrictedTo.includes(role.name))
  ) {

    msg.reply('You do not have the necessary permissions to use this bot.')
    return
  }

  const content = msg.content.substr(prefix.length, msg.content.length - prefix.length)

  const result = parser.parse(content)

  switch (result.command) {
    case 'help':
      const helpEmbed = {
        fields: [
          {
            name: `${prefix} add [tags(, tags)*] recommendation`,
            value: 'Adds the `recommendation` with the given `tags`.'
          },
          {
            name: `${prefix} reck [tags(, tags)*]`,
            value: 'Recommends a random entry to you that fulfills all given `tags`.'
          },
          {
            name: `${prefix} change ID [tags(, tags)*] recommendation`,
            value: 'Updates the entry with ID `ID` with new `tags` and `recommendation`.'
          },
          {
            name: `${prefix} remove ID`,
            value: 'Removes the entry with ID `ID`.'
          },
          {
            name: `${prefix} list`,
            value: 'Lists all tags available.'
          },
          {
            name: `${prefix} role (add / remove) name`,
            value: 'Adds / removes the `name` of a role that is allowed to use this bot.'
          },
          {
            name: `${prefix} role list`,
            value: 'Lists all roles that are allowed to use this bot.'
          },
          {
            name: '--',
            value: '(value)* means an optional list of values. ( A / B ) means either A or B.'
          }
        ]
      }

      msg.channel.send({ embed: helpEmbed })

      break

    case 'add':

      const newID = recommendations.currentID
      recommendations.currentID = recommendations.currentID + 1

      recommendations.values.set(
        newID,
        { tags: result.tags, recommendation: result.recommendation }
      )

      result.tags.forEach(element => {
        recommendations.tags.add(element)
      });

      const addJson = createJSON()

      fs.writeFile('data.json', addJson, () => {

        const newEntry = recommendations.values.get(newID)
        msg.channel.send('**Added** :+1:', { embed: recommendationEmbed(newID, newEntry) })

      })

      break
    case 'recommend':

      const filtered = recommendations.values.filter(element => {

        return element.tags.filter(e => result.tags.includes(e)).length === result.tags.length

      })

      if (filtered.size === 0) {
        msg.channel.send('Could not find any recommendation that contains all requested tags.')
        return
      }

      const randomKey = filtered.randomKey()
      const randomEntry = filtered.get(randomKey)

      msg.channel.send('**How about**:', { embed: recommendationEmbed(randomKey, randomEntry) })

      break
    case 'change':

      const changedID = parseInt(result.id)

      if (!recommendations.values.has(changedID)) {
        msg.channel.send(`ID ${changedID} not found.`)
        break
      }

      recommendations.values.set(
        changedID,
        { tags: result.tags, recommendation: result.recommendation }
      )

      const changedEntry = recommendations.values.get(changedID)

      recommendations.tags = new Set(
        recommendations.values.map((value) => { return value.tags }).reduce((accumulator, value) => { return accumulator.concat(value) }, [])
      )
      const changedJson = createJSON()

      fs.writeFile('data.json', changedJson, () => {

        msg.channel.send(`**Changed ID ${changedID} to:**`, { embed: recommendationEmbed(changedID, changedEntry) })

      })

      break

    case 'remove':

      const removeID = parseInt(result.id)

      if (!recommendations.values.has(removeID)) {
        msg.channel.send(`ID ${removeID} not found.`)
        break
      }

      recommendations.values.delete(removeID)

      recommendations.tags = new Set(
        recommendations.values.map((value) => { return value.tags }).reduce((accumulator, value) => { return accumulator.concat(value) }, [])
      )

      const removedJSON = createJSON()

      fs.writeFile('data.json', removedJSON, () => {

        msg.channel.send(`**Removed ID ${removeID}.**`)

      })

      break
    case 'list':

      const listEmbed = {
        description: [...recommendations.tags].join(', ')
      }

      msg.channel.send('**All tags:**', { embed : listEmbed })

      break
      case 'role':

        switch (result.modifier) {
          case 'add':
            config.restrictedTo.add(result.name)
  
            const addJson = JSON.stringify({ prefix : config.prefix, restrictedTo : [...config.restrictedTo] })
             
            fs.writeFile('config.json', addJson, () => { })
  
            break;
          case 'remove':
            config.restrictedTo.delete(result.name)
  
            const removeJson = JSON.stringify({ prefix : config.prefix, restrictedTo : [...config.restrictedTo] })
            fs.writeFile('config.json', removeJson, () => { })
  
            break;
          case 'list':
            break;
          default:
            throw `role command received an unexpected modifier from the parser: ${result.modifier}`
        }
  
        const roleEmbed = {
          description: [...config.restrictedTo].join(', ')
        }
        msg.channel.send('**Roles allowed to use this bot (+ Admins):**', { embed: roleEmbed })
  
        break;
    case 'not-found':
      msg.channel.send('I did not understand your input. Type `' + prefix + 'help` for help')
      break;
    default:
      throw `Parser returned unexpected result: ${result.command}`
  }

})

const auth = require('./auth.json')

client.login(auth.token)
