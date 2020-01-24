function handle({ recommendations, result }) {

  const removeID = parseInt(result.id)

  if (!recommendations.values.has(removeID)) {
    return {
      reply : (msg) => msg.channel.send(`ID ${removeID} not found.`)
    }
  }

  recommendations.values.delete(removeID)

  recommendations.tags = new Set(
    recommendations.values.map((value) => { return value.tags }).reduce((accumulator, value) => { return accumulator.concat(value) }, [])
  )

  return { 
    saveRecs : Symbol(),
    reply: (msg) => msg.channel.send(`**Removed ID ${removeID}.**`)
  }

}

module.exports = handle