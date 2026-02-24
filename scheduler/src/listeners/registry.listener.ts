import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Domain } from 'src/modules/registry/domain/Domain';
import { IRegistryPort } from 'src/modules/registry/domain/IRegistryPort';
import { PrismaService } from 'src/prisma.service';
import { RESOURCE_ADAPTERS } from 'src/registry.listener.module';
import { AppEvents, EventHandles, GroupedResult } from 'src/types';

@Injectable()
export class RegistryListener implements EventHandles {
  private readonly logger = new Logger(RegistryListener.name);

  constructor(
    private prisma: PrismaService,
    @Inject(RESOURCE_ADAPTERS) private httpServices: IRegistryPort[],
  ) {}

  @OnEvent(AppEvents.REGISTRY_TO_EXPIRE)
  async handle(event: GroupedResult[]): Promise<void> {
    this.logger.debug('Init update registries');

    const startTime = Date.now();
    let total = 0;
    for (const { dw_registry } of event) {
      for (const httpService of this.httpServices) {
        const result = await httpService.searchByDomain(
          new Domain(dw_registry.domain),
        );

        if (!result) {
          continue;
        }

        await this.prisma.dw_registry.update({
          where: { id: dw_registry.id },
          data: {
            updated_at: new Date(),
            registry_created_at: result.getRegistryCreatedAt,
            registry_updated_at: result.getRegistryUpdatedAt,
            registry_expires_at: result.getRegistryExpiresAt,
            origin: result.getOrigin,
          },
        });
        total += 1;

        await new Promise((r) => setTimeout(r, 1000));
        break;
      }
    }

    // LOGS
    const endTime = Date.now();

    this.logger.debug('Registries updated');
    this.logger.debug('Start time: ', startTime);
    this.logger.debug('End time: ', endTime);
    this.logger.debug('Total records updated: ', total);
    this.logger.debug('Execution time: ', endTime - startTime);
  }
}
