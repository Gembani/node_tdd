```
npm init -y
```

```
npm i express sequelize mysql2 body-parser --save
```


```
npm i -g sequelize-cli
```

```
npm install dotenv --save
```

```
sequelize init:model
```

```
sequelize init:migrations
```

# Database creation (MYSQL VERSION)
create /.env and /.env.test files like:

```
DB_NAME=your_db_name
DB_USER=your_db_username
  DB_PASSWORD=your_db_password
DB_HOST=your_host (usually 127.0.0.1)
  DB_DIALECT=postgres
  ```

  create config/config.js

  ```javascript
const env = process.env.NODE_ENV || 'development'
switch (env) {
    case 'development':
      require('dotenv').config({path: process.cwd() + '/.env'})
        break
    case 'test':
        require('dotenv').config({path: process.cwd() + '/.env.test'})
  }

const connection_details = {
username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          dialect: process.env.DB_DIALECT,
}

module.exports = {
  'test': connection_details,
  'development': connection_details,
  'production': connection_details
}
```
in /model/index.js, replace

```
const config = require(__dirname + '/../config/config.json')[env];
```
by

```
const config = require(__dirname + '/../config/config')[env];
```

and add 

```javascript
db.close = async () => {
  await db.sequelize.close()
};

```
```
NODE_ENV=development sequelize db:create
```
```
NODE_ENV=test sequelize db:create
```

```
sequelize model:generate --name Author --attributes firstName:string,lastName:string
```
```
sequelize model:generate --name Post --attributes title:string,content:text
```

```
sequelize db:migrate```

sequelize migration:create --name='add-author-id-to-posts'

Replace the migration file with:

```javascript
module.exports = {
up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn('Posts', 'AuthorId',
          {
type: Sequelize.INTEGER,
references: {
model: 'Authors', // name of Target model
key: 'id', // key in Target model that we're referencing
},
onUpdate: 'CASCADE',
onDelete: 'SET NULL',
}
)
      },

down: (queryInterface) => {
        return queryInterface.removeColumn('Posts', 'AuthorId')
      }
}
```


```
sequelize db:migrate
```

# In author model

```javascript
Author.associate = (models) => {
  Author.hasMany(models.post)
}
```

# In post model

```javascript
Post.associate = (models) => {
  Post.belongsTo(models.author)
}
```

Create app.js

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const db = require('./models')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(express.static('app/public'))

module.exports = app
```

Create server.js

```javascript
const db = require('./models')
const app = require('./app')

app.listen(8080, () => console.log('App listening on port 8080!'))

```


```
npm install --save-dev babel-cli babel-preset-env jest supertest superagent
```

add this line to your scripts in package.json

```
"test": "jest --runInBand spec"

```
create jest.config.js  file

```javascript
module.exports = {
verbose: true,
};

```

create a test file in spec folder (/spec/api.test.js)

  ```
  const request = require('supertest')
  const app = require('../app')
  const db = require('../models');

  describe('GET /', () => {
      let response;

      beforeEach(async () => {
          response = await request(app).get('/');
          })

      test('It should respond with a 200 status code', async () => {
          expect(response.statusCode).toBe(200);
          });
      });
```

create a helpers to clean database (/spec/helpers/cleanDb.js)

  ```javascript
  const cleanDb = async (db) => {
    await db.Author.truncate({ cascade: true });
    await db.Post.truncate({ cascade: true });
  }
module.exports = cleanDb

```


add these line in the spec file to clean the database before and after the tests

```javascript
const cleanDb = require('./helpers/cleanDb')

beforeAll(async () => {
    await cleanDb(db)
    });

afterAll(async () => {
    await cleanDb(db)
    await db.close()
    });
```

```
npm run test
```

  ```
expect(received).toBe(expected) // Object.is equality

  Expected: 200
  Received: 404
  ```

The route was not found (404). Let's create it

In app.js

```javascript
app.get('/', (req, res) => {
  res.status(200).send('Hello.')
})
```

Test pass !

Let's write a new test 

```javascript
describe('POST /author', () => {

  let response;
  let data = {};

  beforeAll(async () => {
    data.firstName = 'Seb'
    data.lastName = 'Ceb'
    response = await request(app).post('/author').send(data);
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});

```

404 error ! Let's add the route (app.js)

```javascript
app.post('/author', (req, res) => {
  res.status(200).send('Author post')
})
```

Tests OK !

But we want some more functionality with this route. We want actually to create a new author with a firstName and lastName and get a json of this author.

```
test('It should return a json with the new author', async () => {
  expect(response.body.firstName).toBe(data.firstName);
  expect(response.body.lastName).toBe(data.lastName);
});
```

The tests fail.
Let's modify our controller


```javascript
app.post('/author', async (req, res) => {
  await db.Author.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }).then((result) => res.json(result))
})

```

Test passed !


Now we want to know if the author has been really created in database

```
  test('It should create and retrieve a post for the selected author', async () => {
    const author = await db.Author.findOne({where: {
      id: response.body.id
    }})
    expect(author.id).toBe(response.body.id)
    expect(author.firstName).toBe(data.firstName)
    expect(author.lastName).toBe(data.lastName)
  });

```

It passes too !

Now, the basic functionality of this controller works well.
...

Let's do the same thing with getting an author.
```javascript

describe('GET /authors', () => {

  let response;
  let data = {};

  beforeAll(async () => await cleanDb(db))

  describe('when there is no author in database', () => {
    beforeAll(async () => {
      response = await request(app).get('/authors').set('Accept', 'application/json');
    })

    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
  })
});
```

Just in case .

```
    test('It should not retrieve any author in db', async () => {
      const authors = await db.Author.findAll()
      expect(authors.length).toBe(0);
    });
    ```
```
///Expected 200, received 404.
```

Let's create the route.

```
app.get('/authors', (req, res) => {
  res.status(200).send('Hello World!')
})
```

Test OK !

```
test('It should return a json with a void array', async () => {
  expect(response.body).toStrictEqual([]);
});
```

Test fail

```
app.get('/authors', async (req, res) => {
  await db.Author.findAll().then((result) => res.json(result))
})
```


```
npm install factory-girl 
```


Let's create factory in spec/factories/author.js

```
const factoryGirl = require('factory-girl')
const adapter = new factoryGirl.SequelizeAdapter()
factory = factoryGirl.factory
factory.setAdapter(adapter)

const Author = require('../../models').Author

factory.define('author', Author, {
  firstName: factory.sequence((n) => `firstName${n}`),
  lastName: factory.sequence((n) => `lastName${n}`),
})
```

import factory in the test file
```
require('./factories/author').factory
const factory = require('factory-girl').factory
```

```
npm install --save expect
```

```
npm install --save-dev jest-extended
```