"use server"

import { RegistryRepository } from "@/modules/registry/infra/db/RegistryRepository";
import { CreateWatcherUseCase } from "@/modules/watcher/application/usecases/CreateWatcherUseCase";
import { GetWatcherByEmailUseCase } from "@/modules/watcher/application/usecases/GetWatcherByEmailUseCase";
import { WatcherRepository } from "@/modules/watcher/infra/db/WatcherRepository";
import { Response } from "./registry.action";
import { WatcherMapper } from "@/modules/watcher/application/mappers/WatcherMapper";
import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
import { isTrustedEmail, isValidEmail, TRUSTED_EMAIL_DOMAINS } from "@/libs/email.validation";

export async function watchDomain(_prevState: any, formData: FormData): Promise<Response<any>> {

  const useCase = new CreateWatcherUseCase(new WatcherRepository(), new RegistryRepository());

  const registryId = formData.get("registryId");
  const email = formData.get("email");

  if (!registryId) {
    return { ok: false, message: "registry is required" }
  }

  if (!email) {
    return { ok: false, message: "email is required" }
  }

  if (!isValidEmail(email.toString())) {
    return { ok: false, message: "email is not valid" }
  }

  if (!isTrustedEmail(email.toString())) {
    return { ok: false, message: `email domain not trusted. Use one of: ${TRUSTED_EMAIL_DOMAINS.join(", ")}` }
  }

  const result = await useCase.execute({ registryId: registryId.toString(), email: email.toString() })

  if (!result) {
    return { ok: false, message: "some problem to save the notification" }
  }

  return { ok: false, message: "not implemented" };
}

export async function myDomains(_prevState: any, formData: FormData): Promise<Response<{ email: string, items: WatcherResponse[] }>> {

  const useCase = new GetWatcherByEmailUseCase(new WatcherRepository());

  const email = formData.get("email");

  if (!email) {
    return { ok: false, message: "email is required" }
  }

  if (!isValidEmail(email.toString())) {
    return { ok: false, message: "email is not valid" }
  }

  if (!isTrustedEmail(email.toString())) {
    return { ok: false, message: `email domain not trusted. Use one of: ${TRUSTED_EMAIL_DOMAINS.join(", ")}` }
  }

  const data = await useCase.execute(email.toString());
  return { ok: true, data: { email: email.toString(), items: data.map(WatcherMapper.toDTO) } }

}
