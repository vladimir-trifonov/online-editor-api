const express = require('express')
const app = express()

var bodyParser = require('body-parser')
var cors = require('cors')

export const TEXT_CHANGED = 'TEXT_CHANGED'

app.use(cors())
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// Parse application/json
app.use(bodyParser.json())
app.post('/api/editor', (req, res) => {
  switch (req.body.action) {
    case TEXT_CHANGED:
      break
    default:
      res.json(req.body)
      break
  }
})

app.listen(3030, () => console.log('Example app listening on port 3030!'))
