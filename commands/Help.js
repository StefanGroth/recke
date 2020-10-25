function handle({ msg, config }) {

  const prefix = config.prefix

  const helpEmbed = {
    fields: [
      {
        name: `${prefix} add [tags(, tags)*] recommendation`,
        value: 'Adds the `recommendation` with the given `tags`.'
      },
      {
        name: `${prefix} reck [tags(, tags)*]`,
        value: 'Recommends a random entry to you that fulfills all given `tags`.'
      },
      {
        name: `${prefix} change ID [tags(, tags)*] recommendation`,
        value: 'Updates the entry with ID `ID` with new `tags` and `recommendation`.'
      },
      {
        name: `${prefix} remove ID`,
        value: 'Removes the entry with ID `ID`.'
      },
      {
        name: `${prefix} list`,
        value: 'Lists all tags available.'
      },
      {
        name: `${prefix} role (add / remove) name`,
        value: 'Adds / removes the `name` of a role that is allowed to use this bot.'
      },
      {
        name: `${prefix} role list`,
        value: 'Lists all roles that are allowed to use this bot.'
      },
      {
        name: '--',
        value: '(value)* means an optional list of values. ( A / B ) means either A or B.'
      }
    ]
  }
  
  msg.channel.send({ embed: helpEmbed })

  return {}

}

module.exports = handle