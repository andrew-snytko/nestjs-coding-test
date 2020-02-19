import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
    providers: [ConfigService],
})
export class ConfigModule {
    public static forRoot(): DynamicModule {
        const providers = [ConfigService];
        return {
            module: ConfigModule,
            providers,
            exports: providers,
        };
    }
}
