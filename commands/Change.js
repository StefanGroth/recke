const recommendationEmbed = require('../utility/RecommendationEmbed')

function handle({recommendations, result}) {

  const changedID = parseInt(result.id)

  if (!recommendations.values.has(changedID)) {
    
    return {
      saveRec : Symbol(),
      reply : (msg) => msg.channel.send(`ID ${changedID} not found.`)
    }
    
  }

  recommendations.values.set(
    changedID,
    { tags: result.tags, recommendation: result.recommendation.trim() }
  )

  recommendations.tags = new Set(
    recommendations.values.map((value) => { return value.tags }).reduce((accumulator, value) => { return accumulator.concat(value) }, [])
  )
  
  const changedEntry = recommendations.values.get(changedID)

  return {
    saveRecs : Symbol(),
    reply : (msg) => msg.channel.send(`**Changed ID ${changedID} to:**`, { embed: recommendationEmbed(changedID, changedEntry) })
  }
  

}

module.exports = handle