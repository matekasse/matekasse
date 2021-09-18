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
3. Run `yarn serve` in the `app` folder and `ENVIRONMENT=development JWT_SECRET_KEY="notsosecretdev" DATABASE_CONNECTION_URL="postgresql://mate-user:1234@127.0.0.1:5432/mate-db"  yarn start:dev` in the `api` folder.
4. Access the frontend via `http://localhost:3000`
5. At the first startup the default user `Admin` with the password `Admin` will be created.
6. Use the [init-script](api/init-scripts) or create products and add stock with a warehouse-transaction.
7. Create yourself a user account, top-up your balance with the admin and get yourself a drink.

## What does admin user exactly mean?

An admin user in the matekasse is allowed to do nearly anything.
We implemented this user type with the assumption that he is managing the server and could theoretically just change values in the database.
That means, that he is able to break some things on the api level if he wants.
However, the frontend will prevent harmfull things by not having a button for it or displaying a warning.
So if you are an admin and don't want to break the app, just use our "official" site and not use the api directly. :)
However, normal users are NOT allowed to do things via the api they should not do.
If you are able to do things as a user you think you should not be allowed to, please open a pr.

## API

More docs about all routes, tests, ... can be found [here](api/README.md).

## APP

More docs about the frontend SPA can be found [here](app/README.md).
