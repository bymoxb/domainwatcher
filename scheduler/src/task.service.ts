import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service.js';
import { AppEvents, GroupedResult } from './types/index.js';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async main() {
    this.logger.debug('Init getting db results');
    const startTime = Date.now();

    // Get data from DB
    const result = await this.getRegistries();

    this.eventEmitter.emit(AppEvents.REGISTRY_TO_EXPIRE, result);

    const endTime = Date.now();

    this.logger.debug('End getting db results');
    this.logger.debug('Start time: ' + startTime);
    this.logger.debug('End time: ' + endTime);
    this.logger.debug('Total records: ' + result.length);
    this.logger.debug('Execution time: ' + (endTime - startTime));
  }

  private async getRegistries(): Promise<GroupedResult[]> {
    const DAYS_LEFT = +this.config.get('DW_EXPIRATION_THRESHOLD');

    const now = new Date();
    const final = new Date(now);
    final.setDate(now.getDate() + DAYS_LEFT);

    const origins = await this.prisma.dw_registry.findMany({
      select: { id: true, domain: true, registry_expires_at: true },
      where: {
        registry_expires_at: {
          lt: final,
        },
      },
    });

    const originIds = origins.map((item) => item.id);

    const watchers = await this.prisma.dw_watcher.findMany({
      select: {
        id: true,
        mail_address: true,
        dw_registry: {
          select: {
            id: true,
            domain: true,
            registry_expires_at: true,
          },
        },
      },
      where: {
        registry_id: {
          in: originIds,
        },
        notification_enabled: true,
        deleted_at: null,
      },
      // include: {
      //   dw_registry: true,
      // }
    });

    // console.table(watcher.map(({ id, mail_address }) => ({ id, mail_address })))
    // console.log(watcher);
    // Agrupar por dw_registry.id
    const grouped = watchers.reduce((acc, watcher) => {
      const { dw_registry } = watcher;
      const registryId = dw_registry.id;

      // Si no existe el grupo para ese dw_registry.id, lo creamos
      if (!acc[registryId]) {
        acc[registryId] = {
          dw_registry: dw_registry,
          watchers: [],
        };
      }

      // Agregar el watcher a su grupo correspondiente
      acc[registryId].watchers.push(watcher);

      return acc;
    }, {});

    // Convertimos el objeto agrupado en un array de resultados
    return Object.values(grouped);
  }
}
