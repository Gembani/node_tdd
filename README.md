# Node API TDD

In the node ecosystem, We haven't been able to find an article describing the way we prefer to practice TDD internally. We are describing how we prefer to practice TDD in node in this article.

### Prerequisites

You will need `node` to be installed on your computer.
You can download it here depending on your OS.

[Node](https://nodejs.org/en/download/)

### Installing

```
npm install
```

Create .env and .env.test files with your database credentials in them like this:

`.env`
```
DB_NAME=node_tdd
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST='127.0.0.1'
DB_DIALECT=postgres
```


`.env.test`
```
DB_NAME=node_tdd_test
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST='127.0.0.1'
DB_DIALECT=postgres
```

## Running the server

```
node server.js
```

## Running the tests

```
npm run tests
```

## Authors

* **CEBULA Sébastien** - [Seybol](https://github.com/Seybol)
* **STOCK Nicholas** - [nicholasjstock](https://github.com/nicholasjstock)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details