const fs = require('fs')

function backup(path) {
  const file = fs.readFileSync(path)
  fs.writeFileSync(`${path}_backup_${Date.now()}`, file)
}

module.exports = backup