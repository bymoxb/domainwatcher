import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRegistryPort } from 'src/modules/registry/domain/IRegistryPort';
import { HttpClient } from 'src/modules/registry/infra/http/http.client';
import { RdapRegistryAdapter } from 'src/modules/registry/infra/http/RdapRegistryAdapter';
import { WhoisJsonAdapter } from 'src/modules/registry/infra/http/WhoisJsonAdapter';

export const RESOURCE_ADAPTERS = Symbol('RESOURCE_ADAPTERS');

@Module({
  providers: [
    {
      provide: RESOURCE_ADAPTERS,
      useFactory: (config: ConfigService) => {
        const client = new HttpClient();
        const adapters: IRegistryPort[] = [new RdapRegistryAdapter(client)];
        if (config.get('WHOISJSON_API_KEY')) {
          adapters.push(
            new WhoisJsonAdapter(client, config.get('WHOISJSON_API_KEY')),
          );
        }
        return adapters;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RESOURCE_ADAPTERS],
})
export class RegistryModule {}
