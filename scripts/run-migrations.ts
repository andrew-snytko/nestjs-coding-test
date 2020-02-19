import { config } from 'dotenv';
import { createConnection } from "typeorm";
// tslint:disable-next-line no-submodule-imports
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import ormconfig from '../ormconfig.json';
import { ENV_VARIABLE, REQUIRED_ENV_VARIABLES } from '../src/config/config.constants.js';

function getProcessEnv(env: string): string | undefined {
    return process.env[env];
}

async function bootstrap() {
    const NODE_ENV = getProcessEnv('NODE_ENV') || 'development';
    const envFilePath = `env/${NODE_ENV}.env`;

    config({ path: envFilePath });

    for (const requiredVariable of REQUIRED_ENV_VARIABLES) {
        const variable = Object.keys(process.env).find(
            envVar => envVar === requiredVariable,
        );

        if (!variable) {
            throw new Error(
                `Missing required ${requiredVariable} ENV variable`,
            );
        }
        if (process.env[variable] === '') {
            throw new Error(
                `Required ENV variable ${requiredVariable} is empty`,
            );
        }
    }

    const host = getProcessEnv(ENV_VARIABLE.DB_HOST);
    const port = Number(getProcessEnv(ENV_VARIABLE.DB_PORT));
    const username = getProcessEnv(ENV_VARIABLE.DB_USERNAME);
    const password = getProcessEnv(ENV_VARIABLE.DB_PASSWORD);
    const database = getProcessEnv(ENV_VARIABLE.DB_NAME);
    const synchronize =
        getProcessEnv(ENV_VARIABLE.DB_SYNCHRONIZE) === 'true'
            ? true
            : false;

    const [defaultConfig] = ormconfig;
    const { entities, migrations, logging } = defaultConfig;

    const connection = await createConnection({
        type: 'postgres',
        entities,
        migrations,
        logging: logging as LoggerOptions,
        host,
        port,
        username,
        password,
        database,
        synchronize,
    });

    await connection.runMigrations();

    process.exit(0);
};

bootstrap();
