export enum EnvVariableNames {
    DatabaseConnectionUrl = "DATABASE_CONNECTION_URL"
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
