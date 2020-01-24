function recommendationEmbed(id, recommendation) {
  return {
    description: `**ID:** ${id}\n **Tags:** [` + recommendation.tags.join(', ') + `]\n**Recommendation:**\n ${recommendation.recommendation}`
  }
}

module.exports = recommendationEmbed