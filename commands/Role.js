function handle({ msg, config, result }) {

  switch (result.modifier) {
    case 'add':
      config.restrictedTo.add(result.name)       
      break;
    case 'remove':
      config.restrictedTo.delete(result.name)
      break;
    case 'list':
      break;
    default:
      throw `role command received an unexpected modifier from the parser: ${result.modifier}`
  }

  const roleEmbed = {
    description: [...config.restrictedTo].join(', ')
  }

  msg.channel.send('**Roles allowed to use this bot (+ Admins):**', { embed: roleEmbed })

  return {
    saveConfig : result.modifier == 'list' ? undefined : Symbol(),
  }

}

module.exports = handle