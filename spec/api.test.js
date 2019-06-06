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

  beforeEach(async () => {
    response = await request(app).get('/');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /authors', () => {

  describe('With one or more authors in database', () => {
    beforeEach(async () => {
      //Create authors with factories
    })
    test('It should respond with a 200 status code', async () => {
    });
    test('It should return a json with all authors', async () => {
    });
  })

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
