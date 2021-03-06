# matekasse

Matekasse is a project to track your current drinks and costs per user.
It's intended usage is for shared student flats, a small club, associations or similar.

Just book the drink you just got out of the fridge or coffee maker:
![startpage](./docs/images/startpage.png)

Never lose track of your spendings:
![userpage](./docs/images/userpage.png)

Easy management of users, products and your warehouse:
![adminpage](./docs/images/adminpage1.png)
![adminpage](./docs/images/adminpage2.png)
![adminpage](./docs/images/adminpage3.png)

## Run the latest version

1. Copy the `docker-compose.yml` file in this project.
2. Edit the file to your needs. You definitely want to change the `JWT_SECRET_KEY` to a save, random generated passphrase.
3. Run `docker-compose up`.
4. Access the frontend via `http://0.0.0.0:1337`.
5. Log in with the default credentials (username: Admin, password: Admin)
6. Change your Admin password immediately!

Currently supported architectures are amd64, arm64 and arm/v7.

## I want to use HTTPS on this application

You can certainly use HTTPS for this application. Simply put a reverse proxy on top of it, which handles it for you.
We use [caddy](https://caddyserver.com/) for our own deployment.

## Run latest testing version

The tag `latest_testing` contains the latest build from the `main` branch.
This means that it contains the newest code and features but is not as tested as the latest stable release.
Only use it, if you know what you are doing (or if you want to open some bug issues).
For the beste experience of matekasse use the latest stable release.
Note: The `latest_testing` is only available for x86_64 and not for arm.

## Developer getting started

1. Run `yarn install`.
2. Run `docker-compose up` with the dev compose file, to get a database.
3. Run `yarn serve` in the `app` folder and `yarn start:dev` in the `api` folder.
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
