async function handle({ msg, Recommendation, result }) {

  const removeID = parseInt(result.id)

  await Recommendation.deleteOne({ id: removeID })
  
  msg.channel.send(`**Removed ID ${removeID}.**`)

  return { }

}

module.exports = handle