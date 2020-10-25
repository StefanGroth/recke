const recommendationEmbed = require('../utility/RecommendationEmbed')

async function handle({ msg, Recommendation, MaxId, result }) {

  const newID = await MaxId.findOneAndUpdate({}, {$inc : { value : 1}}, { useFindAndModify: false})

  console.log(newID)

  const addResult = await Recommendation.create(
    {
      id : newID.value,
      tags: result.tags,
      recommendation : result.recommendation.trim()
    }
  )

  console.log(addResult)
  
  msg.channel.send('**Added** :+1:', { embed: recommendationEmbed(addResult) })

}

module.exports = handle