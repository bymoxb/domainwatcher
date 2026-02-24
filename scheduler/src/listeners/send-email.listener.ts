import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { calcDaysLeft } from 'src/libs';
import { AppEvents, EventHandles, GroupedResult } from 'src/types';

@Injectable()
export class SendMailListener implements EventHandles {
  private readonly logger = new Logger(SendMailListener.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  @OnEvent(AppEvents.REGISTRY_TO_EXPIRE)
  async handle(result: GroupedResult[]) {
    this.logger.debug('Init sending notifications');

    const startTime = Date.now();

    // Sent mails
    const { emailSent, totalEmails } = await this.sendMails(result);

    // LOGS
    const endTime = Date.now();

    this.logger.debug('Notifications sent');
    this.logger.debug('Start time: ' + startTime);
    this.logger.debug('End time: ' + endTime);
    this.logger.debug('Mails sent: ' + emailSent);
    this.logger.debug('Total emails: ' + totalEmails);
    this.logger.debug('Execution time: ' + (endTime - startTime));
  }

  private async sendMails(result: GroupedResult[]) {
    let emailSent = 0;
    let totalEmails = 0;
    const toEmail = this.config.get<string>('MAIL_TO', '');

    for (const item of result) {
      try {
        const domain_name = item.dw_registry.domain;
        const expiration_date =
          item.dw_registry.registry_expires_at.toLocaleDateString();
        const days_remaining = calcDaysLeft(
          item.dw_registry.registry_expires_at,
        );
        const emails = item.watchers.map((item) => item.mail_address);

        await this.mailerService.sendMail({
          to: toEmail,
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
        this.logger.error('Error on send notification: ' + error);
      } finally {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return { emailSent, totalEmails };
  }
}
