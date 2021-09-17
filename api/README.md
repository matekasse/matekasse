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

## Migrations

### Create migrations

1. Edit the entities

2. Make sure a `ormconfig.json` in the `api` folder with the following content exists. (Edit according to your database settings):

   ```js
    module.exports = {
        type: "postgres",
        url: "postgresql://mate-user:1234@127.0.0.1:5432/mate-db",
        entities: ["dist/entity/**/*{.js,.ts}"],
        migrations: ["dist/migrations/**/*{.js,.ts}"],
        synchronize: true,
        logging: [],
        cli: {
            migrationsDir: "src/migrations",
        },
    };
   ```

3. Start a postgres database and adjust the credentials in the `ormconfig.json` if needed.

4. Run `yarn build` in the `api` folder.

5. Run `yarn typeorm migration:generate -n CreateDatabase` in the `api` folder, where `CreateDatabase`
   should be the name of the new migration.


### Apply migrations

1. Make sure a `ormconfig.json` in the `api` folder with the following content exists. (Edit according to your database settings):

   ```js
    module.exports = {
        type: "postgres",
        url: "postgresql://mate-user:1234@127.0.0.1:5432/mate-db",
        entities: ["dist/entity/**/*{.js,.ts}"],
        migrations: ["dist/migrations/**/*{.js,.ts}"],
        synchronize: true,
        logging: [],
        cli: {
            migrationsDir: "src/migrations",
        },
    };
   ```

2. Run `yarn build` in the `api` folder.

3. Run `yarn ts-node --transpile-only ./node_modules/typeorm/cli.js migration:run` in the `api` folder.
