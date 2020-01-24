function handle({ recommendations }) {

  const listEmbed = {
    description: [...recommendations.tags].join(', ')
  }

  return {
    reply: (msg) => msg.channel.send('**All tags:**', { embed : listEmbed })
  }

}

module.exports = handle