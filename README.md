# Project initialisation

Let's create a new folder.

```
mkdir node_tdd && cd node_tdd
```

Let's initialize a new node project

```
npm init -y
```

We want to do some TDD while creating a simple API.
In this tutorial, we chose to use ExpressJS as a web framework, Sequelize as the ORM and a parsing middleware body-parse.

```
npm i express sequelize body-parser --save
```

We will use Postgres database, but you can as well use Mysql as well.

```
npm i pg
```

If your "sequelize" command is not found, you can fix it by installing the sequelize-cli.

```
npm i -g sequelize-cli
```

To keep the project clean, we will use dotenv package in order to get the dabasese credentials

```
npm install dotenv --save
```

Now, the base packages of our project are ready to be used. We can start the configuration.

# Sequelize set up
We first initialize our models and migrations folders with sequelize. This will create 2 new folders: a empty migrations folder, and models folder with an index.js file in it.

```
sequelize init:models
```

```
sequelize init:migrations
```

# Database creation (MYSQL VERSION)

Create /.env and /.env.test files like:
We have to create 2 files in project's root.
/.env
/.env.test

We will keep our databases credentials there.
You can for example name your db `node_tdd` and you test db `node_tdd_test`
Fill the below informations in each of these files.

```
DB_NAME=your_db_name
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=127.0.0.1
DB_DIALECT=postgres
```

Create a file named `/config/config.js`

  ```javascript
const env = process.env.NODE_ENV || 'development'

switch (env) {
  case 'development':
    require('dotenv').config({path: process.cwd() + '/.env'})
      break
  case 'test':
    require('dotenv').config({path: process.cwd() + '/.env.test'})
}

module.exports = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
}
```

In `/model/index.js`, replace this line

```javascript
const config = require(__dirname + '/../config/config.json')[env];
```

by this one

```javascript
const config = require(__dirname + '/../config/config');
```

In this same file, we add a function in the `db` object which allows us to close the connection with the database.
We will need this to write our tests later.

```javascript

db.close = async () => {
  await db.sequelize.close()
};

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
sequelize db:migrate
```

```
NODE_ENV=test sequelize db:migrate
```

```
sequelize migration:create --name='add-author-id-to-posts'
```

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
  Author.hasMany(models.Post)
}
```

# In post model

```javascript
Post.associate = (models) => {
  Post.belongsTo(models.Author)
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
npm install --save-dev babel-cli babel-preset-env jest supertest
```

replace the test script in your package.json

```
"test": "jest --runInBand --forceExit spec"

```

<!-- create jest.config.js  file -->


<!-- ```javascript
module.exports = {
verbose: true,
};

``` -->

create a /spec folder and create a test file in in (/spec/api.test.js)

```javascript
const request = require('supertest')
const app = require('../app')
const db = require('../models');

describe('GET /', () => {
  let response;

  beforeEach(async () => {
    await cleanDb(db)
    response = await request(app).get('/');
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});
```

create a helpers to clean our little database (/spec/helpers/cleanDb.js)

  ```javascript
const cleanDb = async (db) => {
  await db.Author.truncate({ cascade: true });
  await db.Post.truncate({ cascade: true });
}
module.exports = cleanDb
```


add these line in the spec file to clean the database before and after the tests
Import our helper at the top of the spec file

```javascript
const cleanDb = require('./helpers/cleanDb')
```

Let's launch our clean before and after all tests

```javascript
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

Here screenshot 1

The route was not found (404). Let's create it

In app.js

```javascript
app.get('/', (req, res) => {
  res.status(200).send('Hello.')
})
```

Here screenshot 2
Test pass !

Let's add a new test block in api.test.js

```javascript
describe('POST /author', () => {

  let response;
  let data = {};

  beforeAll(async () => {
    data.firstName = 'John'
    data.lastName = 'Wick'
    response = await request(app).post('/author').send(data);
  })

  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200);
  });
});

```

Same as above.
404 error ! Let's add the route (app.js)

```javascript
app.post('/author', async (req, res) => {
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

SCREENSHOT 3
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

SCREENSHOT 4
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

SCREENSHOT 5
It passes too !

Now, the basic functionality of this controller works well.
...

Let's do the same thing with getting all authors.
```javascript

describe('GET /authors', () => {

  let response;
  let data = {};

  beforeAll(async () => await cleanDb(db))

  describe('when there is no author in database', () => {
    beforeAll(async () => {
      response = await request(app).get('/authors').set('Accept', 'application/json');
    })

    test('It should not retrieve any author in db', async () => {
      const authors = await db.Author.findAll()
      expect(authors.length).toBe(0);
    });

    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
  })
});
```

```
///Expected 200, received 404.
```

Let's create the route.

```
app.get('/authors', async (req, res) => {
  res.status(200).send('Hello World!')
})
```

SCREENSHOT 6
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
SCREENSHOT 7
TEST ok

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

```javascript
describe('when there is one or more authors in database', () => {
  beforeAll(async () => {
    authors = await factory.createMany('author', 5)
    response = await request(app).get('/authors').set('Accept', 'application/json')
  })

  test('It should not retrieve any author in db', async () => {
    const authorsInDatabase = await db.Author.findAll()
    expect(authorsInDatabase.length).toBe(5)
  });
  test('It should respond with a 200 status code', async () => {
    expect(response.statusCode).toBe(200)
  });
  test('It should return a json with a void array', async () => {
    expect(response.body.length).toBe(5)
    for (i = 0; i < 5 ; i++) {
      const expectedBody = {
        id: authors[i].id,
        firstName: authors[i].firstName,
        lastName: authors[i].lastName,
      }
      expect(response.body).toContainEqual(expectedBody)
    }
  });
})
```

Now we have another error. In the response body we have the authors but with timestamps. 
Let's get rid of them.

```javascript
app.get('/authors', async (req, res) => {
  await db.Author.findAll(
    {attributes: ['id', 'firstName', 'lastName']}
  ).then((result) => {
    return res.json(result)
  })
})
```

SCREENSHOT 8
And now all the tests pass !  

Create Post factory

```javascript
const factoryGirl = require('factory-girl')
const adapter = new factoryGirl.SequelizeAdapter()
factory = factoryGirl.factory
factory.setAdapter(adapter)

const Post = require('../../models').Post

factory.define('post', Post, {
  title: factory.sequence((n) => `title${n}`),
  content: factory.sequence((n) => `content${n}`),
})
```

Import Post factory in test file


```javascript
require('./factories/post').factory
```

```javascript
describe('POST /post', () => {

  let response
  let data = {}
  let post
  let author

  beforeAll(async () => await cleanDb(db))

  describe('The author has one or multiple posts', () => {
    beforeAll(async () => {
      author = await factory.create('author')
      post = await factory.build('post')
      data.title = post.title
      data.content = post.content
      data.AuthorId = author.id
      response = await request(app).post('/post').send(data).set('Accept', 'application/json')
    })
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
  })
});
```

404 ! Create the new route !

```javascript
app.post('/post', async (req, res) => {
  await db.Post.create({
    title: req.body.title,
    content: req.body.content,
    AuthorId: req.body.AuthorId,
  }).then((result) => res.json(result))
})
```

It passes !

Let's add some tests

```javascript
test('It should create and retrieve a post for the selected author', async () => {
  const postsInDatabase = await db.Post.findAll()
  expect(postsInDatabase.length).toBe(1)
  expect(postsInDatabase[0].title).toBe(post.title)
  expect(postsInDatabase[0].content).toBe(post.content)
});

test('It should return a json with the author\'s posts', async () => {
  expect(response.body.title).toBe(data.title);
  expect(response.body.content).toBe(data.content);
});

test('The post should belong to the selected authors\' posts', async () => {
  const posts = await author.getPosts()
  expect(posts.length).toBe(1)
  expect(posts[0].title).toBe(post.title)
  expect(posts[0].content).toBe(post.content)
})
```

SCREENSHOT 9
And now it's all good !

Now to finish, let's extract each resource's routes in a different file.

Create a file: /app/api/post.js

```javascript
module.exports = (app, db) => {
  app.post('/post', async (req, res) => {
    await db.Post.create({
      title: req.body.title,
      content: req.body.content,
      AuthorId: req.body.AuthorId,
    }).then((result) => res.json(result))
  })
}
```

Delete this piece of code from app.js and require it.

```javascript
const postRoutes = require('./app/api/post')
...
postRoutes(app, db)
```

Do the same thing with author.

Create a file: /app/api/author.js

```javascript
module.exports = (app, db) => {
  app.post('/author', async (req, res) => {
    await db.Author.create({
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

```

Now your app.js file should look like this:

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const db = require('./models')
const postRoutes = require('./app/api/post')
const authorRoutes = require('./app/api/author')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static('app/public'))

app.get('/', async (req, res) => {
  res.status(200).send('Hello World!')
})


postRoutes(app, db)
authorRoutes(app, db)
module.exports = app

```

And your test file should look like this:

```javascript
const request = require('supertest')
const app = require('../app')
const db = require('../models');
const cleanDb = require('./helpers/cleanDb')

require('./factories/author').factory
require('./factories/post').factory
const factory = require('factory-girl').factory

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
    await cleanDb(db)
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

describe('GET /authors', () => {

  let response
  let authors

  beforeAll(async () => await cleanDb(db))

  describe('when there is no author in database', () => {
    beforeAll(async () => {
      response = await request(app).get('/authors').set('Accept', 'application/json');
    })

    test('It should not retrieve any author in db', async () => {
      const authors = await db.Author.findAll()
      expect(authors.length).toBe(0);
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });
    test('It should return a json with a void array', async () => {
      expect(response.body).toStrictEqual([]);
    });
  })

  describe('when there is one or more authors in database', () => {
    beforeAll(async () => {
      authors = await factory.createMany('author', 5)
      response = await request(app).get('/authors').set('Accept', 'application/json')
    })

    test('It should not retrieve any author in db', async () => {
      const authorsInDatabase = await db.Author.findAll()
      expect(authorsInDatabase.length).toBe(5)
    });
    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200)
    });
    test('It should return a json with a void array', async () => {
      expect(response.body.length).toBe(5)
      for (i = 0; i < 5 ; i++) {
        const expectedBody = {
          id: authors[i].id,
          firstName: authors[i].firstName,
          lastName: authors[i].lastName,
        }
        expect(response.body).toContainEqual(expectedBody)
      }
    });
  })
});

describe('POST /post', () => {

  let response
  let data = {}
  let post
  let author

  beforeAll(async () => await cleanDb(db))

  describe('The author has one or multiple posts', () => {
    beforeAll(async () => {
      author = await factory.create('author')
      post = await factory.build('post')
      data.title = post.title
      data.content = post.content
      data.AuthorId = author.id
      response = await request(app).post('/post').send(data).set('Accept', 'application/json')
    })

    test('It should respond with a 200 status code', async () => {
      expect(response.statusCode).toBe(200);
    });

    test('It should create and retrieve a post for the selected author', async () => {
      const postsInDatabase = await db.Post.findAll()
      expect(postsInDatabase.length).toBe(1)
      expect(postsInDatabase[0].title).toBe(post.title)
      expect(postsInDatabase[0].content).toBe(post.content)
    });
    
    test('It should return a json with the author\'s posts', async () => {
      expect(response.body.title).toBe(data.title);
      expect(response.body.content).toBe(data.content);
    });

    test('The post should belong to the selected authors\' posts', async () => {
      const posts = await author.getPosts()
      expect(posts.length).toBe(1)
      expect(posts[0].title).toBe(post.title)
      expect(posts[0].content).toBe(post.content)
    })
  })
});
```

Run the tests.
They still all pass ! We did not break anything !