
function handle({ config, result }) {

  return {
    reply: (msg) => {
      msg.channel.send('I did not understand your input. Type `' + config.prefix + ' help` for help\nParser Error: `' + result.error + '`')
    }
  }

}

module.exports = handle