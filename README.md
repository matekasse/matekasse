# matekasse

Matekasse is a project to track your current drinks and costs per user.
It's intended usage is for shared student flats, a small club, associations or similar.

## Run a stable release

There is no stable release yet.

## Run latest testing version

The tag `latest_testing` contains the latest build from the `main` branch.
This means that it contains the newest code and features but is not as tested as the latest stable release.
Only use it, if you know what you are doing (or if you want to open some bug issues).
For the beste experience of matekasse use the latest stable release.
Note: The `latest_testing` is only available for x86_64 and not for arm.

## Run the latest version

1. Run `docker-compose up`.
2. Access the frontend via `http://localhost:1337`.

Currently supported are amd64 (x86), arm64 and arm/v7.

## Developer getting started

1. Run `yarn install`.
2. Run `docker-compose up` with the dev compose file, to get a database.
3. Run `yarn serve` in the `app` folder and `SECRET="notsosecretdev" DATABASE_CONNECTION_URL="postgresql://mate-user:1234@127.0.0.1:5432/mate-db"  yarn start:dev` in the `api` folder.
4. Access the frontend via `http://localhost:3000`
5. At the first startup the default user `Admin` with the password `Admin` will be created.
6. Use the [init-script](api/init-scripts) or create products and add stock with a warehouse-transaction.
7. Create yourself a user account, top-up your balance with the admin and get yourself a drink.

## API

More docs about all routes, tests, ... can be found [here](api/README.md).

## APP

More docs about the frontend SPA can be found [here](app/README.md).
