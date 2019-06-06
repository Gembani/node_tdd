const request = require('supertest')
const app = require('../app')
const db = require('../models');
const cleanDb = require('./helpers/cleanDb')

beforeAll(async () => {
  await cleanDb(db)
});

afterAll(async () => {
  await cleanDb(db)
  await db.close()
});

describe('GET /', () => {
  let response;

  beforeAll(async () => {
    response = await request(app).get('/');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /author', () => {

  let response;
  let data = {};
  beforeAll(async () => {
    data.firstName = 'Seb'
    data.lastName = 'Ceb'
    console.log(`data = ${JSON.stringify(data)}`)
    response = await request(app).post('/author').send(data).set('Accept', 'application/json');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });

  test('It should return a json with the new author', async () => {
    console.log(response.body)
    expect(response.body.firstName).toBe(data.firstName);
    expect(response.body.lastName).toBe(data.lastName);
  });
  test('It should create and retrieve a post for the selected author', async () => {
    const author = await db.Author.findOne({where: {
      id: response.body.id
    }})
    expect(author.id).toBe(response.body.id)
    expect(author.firstName).toBe(data.firstName)
    expect(author.lastName).toBe(data.lastName)
  });

});

describe('POST /authors/:id/post', () => {

  describe('The author has one or multiple posts', () => {
    beforeEach(async () => {
      //Create posts for author with factories
    })
    test('It should respond with a 200 status code', async () => {
    });
    test('It should create and retrieve a post for the selected author', async () => {
    });
    test('It should return a json with the author\'s posts', async () => {
    });
  })

});
