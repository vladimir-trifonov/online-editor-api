const express = require('express')
const app = express()

var bodyParser = require('body-parser')
var cors = require('cors')

var esClient = require('node-eventstore-client')
var uuid = require('uuid')
var streamName = 'onlineEditor'

const TEXT_CHANGED = 'TEXT_CHANGED'

var connSettings = {}  // Use defaults
var esConnection = esClient.createConnection(connSettings, 'tcp://localhost:1113')
esConnection.connect()
esConnection.once('connected', function (tcpEndPoint) {
  console.log('Connected to eventstore at ' + tcpEndPoint.host + ':' + tcpEndPoint.port)
})

app.use(cors())
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// Parse application/json
app.use(bodyParser.json())

app.post('/api/editor', (req, res) => {
  switch (req.body.action) {
    case TEXT_CHANGED:
      var eventId = uuid.v4()
      var eventData = { action: TEXT_CHANGED, text: req.body.text }
      var event = esClient.createJsonEventData(eventId, eventData, null, TEXT_CHANGED)
      console.log('Appending...')
      esConnection.appendToStream(streamName, esClient.expectedVersion.any, event)
        .then(function (result) {
          console.log('Stored event:', eventId)
          console.log('Look for it at: http://localhost:2113/web/index.html#/streams/onlineEditor')
          res.json(req.body)
        })
        .catch(function (err) {
          console.log(err)
          res.send(500)
        })
      break
    default:
      res.json(req.body)
      break
  }
})

function exitHandler (options, err) {
  if (options.cleanup) esConnection.close()
  if (err) console.log(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

app.listen(3030, () => console.log('Example app listening on port 3030!'))
