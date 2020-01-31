const Author = require('../../mongo_models/author')
module.exports = (app, db) => {
  app.post('/author', async (req, res) => {
    await Author.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }).then((result) => res.json(result))
  })

  app.get('/authors', async (req, res) => {
    await db.Author.findAll(
      {attributes: ['id', 'firstName', 'lastName']}
    ).then((result) => {
      return res.json(result)
    })
  })
}
