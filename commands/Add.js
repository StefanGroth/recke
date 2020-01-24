const recommendationEmbed = require('../utility/RecommendationEmbed')

function handle({ recommendations, result }) {

  const newID = recommendations.currentID
  recommendations.currentID = recommendations.currentID + 1

  recommendations.values.set(
    newID,
    { tags: result.tags, recommendation: result.recommendation.trim() }
  )

  result.tags.forEach(element => {
    recommendations.tags.add(element)
  });

  return {
    saveRecs : Symbol(),
    reply : (msg) => {
      const newEntry = recommendations.values.get(newID)
      msg.channel.send('**Added** :+1:', { embed: recommendationEmbed(newID, newEntry) })
    }
  }

  
}

module.exports = handle