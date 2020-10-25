
function handle({ msg, config, result }) {

  msg.channel.send('I did not understand your input. Type `' + config.prefix + ' help` for help\nParser Error: `' + result.error + '`')

  return {}

}

module.exports = handle