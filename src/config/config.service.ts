import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DotenvParseOutput, parse } from 'dotenv';
import { readFileSync } from 'fs';
// tslint:disable-next-line no-submodule-imports
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import ormconfig from '../../ormconfig.json';
import { ENV_VARIABLE, REQUIRED_ENV_VARIABLES } from './config.constants';
import IEnvConfigInterface from './config.interface';

@Injectable()
export class ConfigService {
    public getNodeEnv(): string {
        return process.env.NODE_ENV || 'development';
    }

    constructor() {
        const NODE_ENV = this.getNodeEnv();

        if (!NODE_ENV) {
            throw new Error('Missing NODE_ENV variable');
        }

        try {
            const envFilePath = `env/${NODE_ENV}.env`;
            const file = readFileSync(envFilePath);
            const envConfig = parse(file);
            process.env = {
                ...this.validateEnvConfig(envConfig),
                ...process.env,
            };
        } catch (error) {
            console.log(
                'Missing env file, using config variables from process.env',
            );
        }
    }

    public getEnvVar(variable: ENV_VARIABLE): string | undefined {
        return process.env[variable];
    }

    public getOrmConfig(): TypeOrmModuleOptions {
        const host = this.getEnvVar(ENV_VARIABLE.DB_HOST);
        const port = Number(this.getEnvVar(ENV_VARIABLE.DB_PORT));
        const username = this.getEnvVar(ENV_VARIABLE.DB_USERNAME);
        const password = this.getEnvVar(ENV_VARIABLE.DB_PASSWORD);
        const database = this.getEnvVar(ENV_VARIABLE.DB_NAME);
        const synchronize =
            this.getEnvVar(ENV_VARIABLE.DB_SYNCHRONIZE) === 'true'
                ? true
                : false;

        const [defaultConfig] = ormconfig;
        const { entities, migrations, logging } = defaultConfig;

        return {
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
        };
    }

    private validateEnvConfig(config: DotenvParseOutput): IEnvConfigInterface {
        const configVariables = Object.keys(config);

        for (const requiredVariable of REQUIRED_ENV_VARIABLES) {
            const variable = configVariables.find(
                configVariable => configVariable === requiredVariable,
            );

            if (!variable) {
                throw new Error(
                    `Missing required ${requiredVariable} ENV variable`,
                );
            }
            if (config[variable] === '') {
                throw new Error(
                    `Required ENV variable ${requiredVariable} is empty`,
                );
            }
        }

        return config;
    }
}
