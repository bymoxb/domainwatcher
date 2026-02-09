"use server"

import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
import { RegistryMapper } from "@/modules/registry/application/mappers/RegistryMapper";
import { GetRegistryByDomainUseCase } from "@/modules/registry/application/usecases/GetRegistryByDomainUseCase";
import { RegistryRepository } from "@/modules/registry/infra/db/RegistryRepository";
import { RdapRegistryAdapter } from "@/modules/registry/infra/http/RdapRegistryAdapter";

export type Response<T> =
  | { ok: false, message: string }
  | { ok: true, data: T }

export async function searchDomain(_prevState: any, formData: FormData): Promise<Response<RegistryResponse>> {
  const useCase = new GetRegistryByDomainUseCase(
    new RegistryRepository(),
    [
      new RdapRegistryAdapter(),
    ]
  );

  const data = await useCase.execute(String(formData.get("domain") ?? ""));

  if (!data) {
    return { ok: false, message: "No results found" };
  }

  return { ok: true, data: RegistryMapper.toDTO(data) }
}
