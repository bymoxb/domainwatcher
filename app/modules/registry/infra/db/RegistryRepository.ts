import prisma from "@/modules/shared/infra/prisma";
import { IRegistryRepository } from "../../domain/IRegistryRepository";
import { Registry } from "../../domain/Registry";
import { Domain } from "../../domain/Domain";

export class RegistryRepository implements IRegistryRepository {
  async create(payload: Registry): Promise<void> {
    await prisma.dw_registry.create({
      data: {
        id: payload.getId,
        domain: payload.getDomain.getValue,
        origin: payload.getOrigin,
        registry_created_at: payload.getRegistryCreatedAt,
        registry_expires_at: payload.getRegistryExpiresAt,
        registry_updated_at: payload.getRegistryUpdatedAt,
        created_at: payload.getCreatedAt,
      },
    });
  }

  async update(payload: Registry): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getById(id: string): Promise<Registry | null> {
    const result = await prisma.dw_registry.findFirst({ where: { id } });

    return result
      ? new Registry({
          id: result.id,
          domain: new Domain(result.domain),
          origin: result.origin,
          registryExpiresAt: result.registry_expires_at,
          registryCreatedAt: result.registry_created_at,
          registryUpdatedAt: result.registry_updated_at,
          //
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        })
      : null;
  }

  async getByDomain(domain: Domain): Promise<Registry | null> {
    const result = await prisma.dw_registry.findFirst({
      where: { domain: domain.getValue },
    });

    return result
      ? new Registry({
          id: result.id,
          domain: new Domain(result.domain),
          origin: result.origin,
          registryExpiresAt: result.registry_expires_at,
          registryCreatedAt: result.registry_created_at,
          registryUpdatedAt: result.registry_updated_at,
          //
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        })
      : null;
  }
}
