const recommendationEmbed = require('../utility/RecommendationEmbed')

async function handle({ msg, Recommendation, result }) {

  const found = await Recommendation.find({
    tags : { $all : result.tags }
  })
    
  if (found.length === 0) {
    msg.channel.send('Could not find any recommendation that contains all requested tags.')
  }
  else {
    const entry = found[Math.floor(Math.random() * found.length)];
    msg.channel.send('**How about**:', { embed: recommendationEmbed(entry) })
  }

  return {}

}

module.exports = handle