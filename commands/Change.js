const recommendationEmbed = require('../utility/RecommendationEmbed')

async function handle({ msg, Recommendation, result }) {

  const changedID = parseInt(result.id)

  let changed = await Recommendation.updateOne(
    { id: changedID },
    {
      $set: {
        tags: result.tags,
        recommendation: result.recommendation
      }
    }
  )

  if (changed.n == 0) {
    msg.channel.send(`ID ${changedID} not found.`)
  }
  else {
    msg.channel.send(`**Changed ID ${changedID} to:**`, { embed: recommendationEmbed({ id : changedID, tags : result.tags, recommendation : result.recommendation }) })
  }

}

module.exports = handle