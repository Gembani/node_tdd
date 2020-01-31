const express = require('express')
const bodyParser = require('body-parser')
const db = require('./models')

const fs = require('fs');
const join = require('path').join;


const postRoutes = require('./app/api/post')
const authorRoutes = require('./app/api/author')
const mongoose = require('mongoose');
const app = express()

connect()

const models = join(__dirname, 'mongo_models');

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^.].*\.js$/))
  .forEach(file => require(join(models, file)));



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('app/public'))

app.get('/', async (req, res) => {
  res.status(200).send('Hello World!')
})


function connect() {
  mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
  return mongoose.connect('mongodb://localhost/noobjs_test', {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

postRoutes(app, db)
authorRoutes(app, db)
module.exports = app
