import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { calcDaysLeft } from "./libs/index.js";
import { PrismaService } from "./prisma.service.js";
import { GroupedResult } from "./types/index.js";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) { }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async main() {
    this.logger.debug("Init schedule scan");
    const startTime = Date.now();

    // Get data from DB
    const result = await this.getRegistries();

    // Sent mails
    const { emailSent, totalEmails } = await this.sendMails(result);

    // LOGS
    const endTime = Date.now();

    this.logger.debug("Notifications sent");
    this.logger.debug("Start time: " + startTime);
    this.logger.debug("End time: " + endTime);
    this.logger.debug("Mails sent: " + emailSent);
    this.logger.debug("Total emails: " + totalEmails);
    this.logger.debug("Execution time: " + (endTime - startTime));
  }

  private async getRegistries(): Promise<GroupedResult[]> {
    const DAYS_LEFT = +this.config.get("DW_EXPIRATION_THRESHOLD");

    const now = new Date();
    const final = new Date(now);
    final.setDate(now.getDate() + DAYS_LEFT);

    const origins = await this.prisma.dw_registry.findMany({
      select: { id: true, domain: true, registry_expires_at: true },
      where: {
        registry_expires_at: {
          lt: final
        },
      },
    });

    const originIds = origins.map(item => item.id);

    const watchers = await this.prisma.dw_watcher.findMany({
      select: {
        id: true, mail_address: true,
        dw_registry: {
          select: {
            id: true, domain: true, registry_expires_at: true
          }
        }
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
          watchers: []
        };
      }

      // Agregar el watcher a su grupo correspondiente
      acc[registryId].watchers.push(watcher);

      return acc;
    }, {});

    // Convertimos el objeto agrupado en un array de resultados
    return Object.values(grouped);
  }

  private async sendMails(result: GroupedResult[]) {
    let emailSent = 0;
    let totalEmails = 0;

    for (const item of result) {
      try {
        const domain_name = item.dw_registry.domain;
        const expiration_date = item.dw_registry.registry_expires_at.toLocaleDateString();
        const days_remaining = calcDaysLeft(item.dw_registry.registry_expires_at);
        const emails = item.watchers.map(item => item.mail_address);

        await this.mailerService.sendMail({
          to: "domainwatcher@illapa.dev",
          bcc: emails,
          subject: `DomainWatcher: ${domain_name} expiring soon`,
          template: 'notification',
          context: {
            domain_name,
            expiration_date,
            days_remaining,
          },
        });

        emailSent++;
        totalEmails += emails.length;

      } catch (error) {
        this.logger.error("Message: " + error);
      } finally {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return { emailSent, totalEmails, };
  }
}
