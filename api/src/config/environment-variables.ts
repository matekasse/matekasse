export enum EnvVariableNames {
    DatabaseConnectionUrl = "DATABASE_CONNECTION_URL",
    JWTSecretKey = "JWT_SECRET_KEY",
    Environment = "ENVIRONMENT",
}

export const getEnvironmentVariable = (
    env: NodeJS.ProcessEnv,
    name: EnvVariableNames
) => {
    const value = env[name];
    if (!value) {
        throw new Error(
            `Expected environment variable ${name} to be set to a non-empty value.`
        );
    }

    return value;
};
