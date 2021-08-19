module.exports = {
    type: "postgres",
    url: "postgresql://mate-user:1234@127.0.0.1:5432/mate-db",
    entities: [
        require( "dist/entity/**/*.js" )
    ],
    migrations: ["dist/migrations/**/*.js"],
    synchronize: true,
    logging: [],
    cli: {
        "migrationsDir": "src/migrations"
    }
}
