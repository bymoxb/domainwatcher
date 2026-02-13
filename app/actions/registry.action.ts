"use server";

import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
import { RegistryMapper } from "@/modules/registry/application/mappers/RegistryMapper";
import { GetRegistryByDomainUseCase } from "@/modules/registry/application/usecases/GetRegistryByDomainUseCase";
import { Domain } from "@/modules/registry/domain/Domain";
import { IRegistryPort } from "@/modules/registry/domain/IRegistryPort";
import { RegistryRepository } from "@/modules/registry/infra/db/RegistryRepository";
import { HttpClient } from "@/modules/registry/infra/http/http.client";
import { RdapRegistryAdapter } from "@/modules/registry/infra/http/RdapRegistryAdapter";
import { WhoisJsonAdapter } from "@/modules/registry/infra/http/WhoisJsonAdapter";

export type Response<T> =
  | { ok: false; message: string }
  | { ok: true; data: T };

const httpClient = new HttpClient();

const adapters: Array<IRegistryPort> = [new RdapRegistryAdapter(httpClient)];

if (process.env.WHOISJSON_API_KEY) {
  adapters.push(
    new WhoisJsonAdapter(httpClient, process.env.WHOISJSON_API_KEY)
  );
}

console.log("Adapters count: " + adapters.length);

export async function searchDomain(
  _prevState: any,
  formData: FormData
): Promise<Response<RegistryResponse>> {
  const domainValue = String(formData.get("domain") ?? "");
  let domain: Domain | null = null;

  try {
    domain = new Domain(domainValue);
  } catch (error: any) {
    return { ok: false, message: error?.message ?? "Invalid format" };
  }

  const useCase = new GetRegistryByDomainUseCase(
    new RegistryRepository(),
    adapters
  );

  const data = await useCase.execute(domain);

  if (!data) {
    return { ok: false, message: "No results found" };
  }

  return { ok: true, data: RegistryMapper.toDTO(data) };
}
