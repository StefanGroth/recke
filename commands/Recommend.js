const recommendationEmbed = require('../utility/RecommendationEmbed')

function handle({ recommendations, result }) {

  const filtered = recommendations.values.filter(element => {
    return element.tags.filter(e => result.tags.includes(e)).length === result.tags.length
  })

  if (filtered.size === 0) {
    return { 
      reply: (msg) => {
        msg.channel.send('Could not find any recommendation that contains all requested tags.')
      }
    }
  }

  const randomKey = filtered.randomKey()
  const randomEntry = filtered.get(randomKey)

  return {
    reply: (msg) => {
      msg.channel.send('**How about**:', { embed: recommendationEmbed(randomKey, randomEntry) })
    }
  }

}

module.exports = handle