function recommendationEmbed(recommendation) {
  return {
    description: `**ID:** ${recommendation.id}\n **Tags:** [` + recommendation.tags.join(', ') + `]\n**Recommendation:**\n ${recommendation.recommendation}`
  }
}

module.exports = recommendationEmbed