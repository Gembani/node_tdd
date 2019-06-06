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
switch (process.env.NODE_ENV) {
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

```
const cleanDb = require('./helpers/cleanDb')

beforeAll(async () => {
  await cleanDb(db)
});

afterAll(async () => {
  await cleanDb(db)
  await db.close()
});
```

