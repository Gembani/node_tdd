const express = require('express')
const bodyParser = require('body-parser')
const db = require('./models')
//const apiPost = require('./app/api/post')
//const apiAuthor = require('./app/api/author')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', async (req, res) => {
  res.status(200).send('Hello World!')
})

app.post('/author', async (req, res) => {
  console.log(req)
  await db.Author.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }).then((result) => res.json(result))
})

app.get('/authors', async (req, res) => {
  // await db.Author.findAll().then((result) => res.json(result))
  await db.Author.findAll(
    {order: [['id', 'ASC']]}
  ).then((result) => {
    console.log('++++++')
    console.log(result)
    return res.json(result)
  })
  
})

app.use(express.static('app/public'))

//apiPost(app, db)
//apiAuthor(app, db)
module.exports = app
