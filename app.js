const express = require('express')
const bodyParser = require('body-parser')
const db = require('./models')
const apiPost = require('./app/api/post')
const apiAuthor = require('./app/api/author')

const app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  res.status(200).send('Hello World!')
})

app.use(express.static('app/public'))

apiPost(app, db)
apiAuthor(app, db)
module.exports = app
