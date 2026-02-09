"use server"

import { RegistryRepository } from "@/modules/registry/infra/db/RegistryRepository";
import { CreateWatcherUseCase } from "@/modules/watcher/application/usecases/CreateWatcherUseCase";
import { GetWatcherByEmailUseCase } from "@/modules/watcher/application/usecases/GetWatcherByEmailUseCase";
import { WatcherRepository } from "@/modules/watcher/infra/db/WatcherRepository";
import { Response } from "./registry.action";
import { WatcherMapper } from "@/modules/watcher/application/mappers/WatcherMapper";
import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
import { isTrustedEmail, isValidEmail, TRUSTED_EMAIL_DOMAINS } from "@/libs/email.validation";
import { GetWatcherByIdUseCase } from "@/modules/watcher/application/usecases/GetWatcherByIdUseCase";
import { ActivateNotificationUseCase } from "@/modules/watcher/application/usecases/ActivateNotificationUseCase";
import { DeactivateNotificationUseCase } from "@/modules/watcher/application/usecases/DeactivateNotificationUseCase";

/**
 * Watches a domain by email.
 */
export async function watchDomain(
  _prevState: any,
  formData: FormData
): Promise<Response<any>> {
  const useCase = new CreateWatcherUseCase(
    new WatcherRepository(),
    new RegistryRepository()
  );

  const registryId = formData.get("registryId");
  const email = formData.get("email");

  if (!registryId) {
    return { ok: false, message: "Registry is required" };
  }

  if (!email) {
    return { ok: false, message: "Email is required" };
  }

  if (!isValidEmail(email.toString())) {
    return { ok: false, message: "Email is invalid" };
  }

  if (!isTrustedEmail(email.toString())) {
    return {
      ok: false,
      message: `Email domain not trusted. Use one of the following: ${TRUSTED_EMAIL_DOMAINS.join(
        ", "
      )}`,
    };
  }

  const result = await useCase.execute({
    registryId: registryId.toString(),
    email: email.toString(),
  });

  if (!result) {
    return {
      ok: false,
      message: "There was a problem saving the notification",
    };
  }

  return { ok: false, message: "Feature not implemented yet" };
}

/**
 * Returns all domains associated with a given email.
 */
export async function myDomains(
  _prevState: any,
  formData: FormData
): Promise<Response<{ email: string; items: WatcherResponse[] }>> {
  const useCase = new GetWatcherByEmailUseCase(new WatcherRepository());

  const email = formData.get("email");

  if (!email) {
    return { ok: false, message: "Email is required" };
  }

  if (!isValidEmail(email.toString())) {
    return { ok: false, message: "Email is invalid" };
  }

  if (!isTrustedEmail(email.toString())) {
    return {
      ok: false,
      message: `Email domain not trusted. Use one of the following: ${TRUSTED_EMAIL_DOMAINS.join(
        ", "
      )}`,
    };
  }

  const data = await useCase.execute(email.toString());
  return {
    ok: true,
    data: { email: email.toString(), items: data.map(WatcherMapper.toDTO) },
  };
}

/**
 * Toggles notifications for a domain.
 */
export async function changeSubscription(
  _prevState: any,
  formData: FormData
): Promise<Response<WatcherResponse>> {
  const rawData = formData.get("watcherId");
  if (!rawData) {
    return { ok: false, message: "A domain is required" };
  }

  const watcherId = rawData.toString();
  const wRepo = new WatcherRepository();
  const getByIdUseCase = new GetWatcherByIdUseCase(wRepo);

  let watcher = await getByIdUseCase.execute(watcherId);

  if (!watcher) {
    return { ok: false, message: "The domain does not exist" };
  }

  const useCase = watcher.getNotificationEnabled
    ? new DeactivateNotificationUseCase(wRepo)
    : new ActivateNotificationUseCase(wRepo);

  watcher = await useCase.execute(watcherId);

  if (!watcher) {
    return { ok: false, message: "The domain does not exist" };
  }

  return { ok: true, data: WatcherMapper.toDTO(watcher) };
}
