function handle({ msg, Recommendation }) {

  Recommendation.distinct('tags', (err, result) => {

    console.log(result)
    msg.channel.send('**All tags:**', {
      embed:
        { description: result.join(', ') }
    })

  })

  return {}
}

module.exports = handle