import prisma from "@/modules/shared/infra/prisma";
import { IWatcherRepository } from "../../domain/IWatcherRepository";
import { Watcher } from "../../domain/Watcher";
import { Registry } from "@/modules/registry/domain/Registry";


export class WatcherRepository implements IWatcherRepository {

  async getByIdAndEmail(id: string, email: string): Promise<Watcher | null> {
    const result = await prisma.dw_watcher.findFirst({ where: { registry_id: id, mail_address: email } });

    return result
      ? new Watcher({
        id: result.id,
        registryId: result.registry_id,
        email: result.mail_address,
        notificationEnabled: result.notification_enabled,
      })
      : null;
  }

  async getById(id: string): Promise<Watcher | null> {
    const result = await prisma.dw_watcher.findFirst({ where: { id } });
    return result
      ? new Watcher({
        id: result.id,
        registryId: result.registry_id,
        email: result.mail_address,
        notificationEnabled: result.notification_enabled,
      })
      : null;
  }

  async getByEmail(email: string): Promise<Array<Watcher>> {
    const result = await prisma.dw_watcher.findMany({
      where: { mail_address: email },
      include: { dw_registry: true },
      orderBy: [
        { notification_enabled: "desc", },
        { created_at: "desc", }],
    });
    return result.map(
      (entity) => {
        return new Watcher({
          id: entity.id,
          registryId: entity.registry_id,
          email: entity.mail_address,
          notificationEnabled: entity.notification_enabled,
          registry: new Registry({
            id: entity.dw_registry.id,
            domain: entity.dw_registry.domain,
            origin: entity.dw_registry.origin,
            registryExpiresAt: entity.dw_registry.registry_expires_at,
            registryCreatedAt: entity.dw_registry.registry_created_at,
            registryUpdatedAt: entity.dw_registry.registry_updated_at,
            //
            createdAt: entity.dw_registry.created_at,
            updatedAt: entity.dw_registry.updated_at,
          })
        })
      },
    );
  }

  async activateNotification(watcherId: string): Promise<void> {
    await prisma.dw_watcher.update({ where: { id: watcherId }, data: { notification_enabled: true } });
  }

  async deactivateNotification(watcherId: string): Promise<void> {
    await prisma.dw_watcher.update({ where: { id: watcherId }, data: { notification_enabled: false } });
  }

  async create(payload: Watcher): Promise<void> {
    await prisma.dw_watcher.create({
      data: {
        id: payload.getId,
        mail_address: payload.getEmail,
        registry_id: payload.getRegistryId,
        notification_enabled: payload.getNotificationEnabled,
      }
    });
  }
}
