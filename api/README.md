# ​matekasse api

## Setup

Run `docker-compose up`.

The api will be exposed to `localhost:1337`.

To create some default products use the provided `init-scripts`.
Run `node init.js` in the `init-scripts/` folder.

After every start the backend checks if all required users are created, this is normal.


## Routes

```
/api/products
/api/tags
/api/users
/api/manufacturers
/api/warehousetransactions
/api/transactions
/api/constants
```

## Tests

Every api endpoint is covered by a test. To run all tests run `yarn test`.

## Variables

The following variables are needed:

```
API_PORT=1337
API_HOST=127.0.0.1
DBDATABASE=mate-db
DBHOST=127.0.0.1
DBPASSWORD=1234
DBPORT=5432
DBUSER=mate-user
NODE_ENV=local

API_PORT_TEST=4242

```
