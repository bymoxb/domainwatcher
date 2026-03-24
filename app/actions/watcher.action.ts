"use server";

import {
  isTrustedEmail,
  isValidEmail,
  TRUSTED_EMAIL_DOMAINS,
} from "@/libs/email.validation";
import { RegistryRepository } from "@/modules/registry/infra/db/RegistryRepository";
import {
  SearchDomainsForm,
  WatcherResponse,
} from "@/modules/watcher/application/dtos/WatcherResponse";
import { WatcherMapper } from "@/modules/watcher/application/mappers/WatcherMapper";
import { ActivateNotificationUseCase } from "@/modules/watcher/application/usecases/ActivateNotificationUseCase";
import { CreateWatcherUseCase } from "@/modules/watcher/application/usecases/CreateWatcherUseCase";
import { DeactivateNotificationUseCase } from "@/modules/watcher/application/usecases/DeactivateNotificationUseCase";
import { GetWatcherByEmailUseCase } from "@/modules/watcher/application/usecases/GetWatcherByEmailUseCase";
import { GetWatcherByIdUseCase } from "@/modules/watcher/application/usecases/GetWatcherByIdUseCase";
import { WatcherRepository } from "@/modules/watcher/infra/db/WatcherRepository";
import { Response } from "./registry.action";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DeleteWatcherUseCase } from "@/modules/watcher/application/usecases/DeleteWatcherUseCase";

/**
 * Watches a domain by email.
 */
export async function watchDomain(
  _prevState: any,
  formData: FormData
): Promise<Response<null>> {
  console.log(formData.values());

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

  return { ok: true, data: null };
}

/**
 * Returns all domains associated with a given email.
 */
export async function myDomains(
  request: SearchDomainsForm
): Promise<Response<WatcherResponse[]>> {
  const { email } = request;

  const useCase = new GetWatcherByEmailUseCase(new WatcherRepository());

  if (!email) {
    return { ok: false, message: "Email is required" };
  }

  if (!isValidEmail(email)) {
    return { ok: false, message: "Email is invalid" };
  }

  if (!isTrustedEmail(email)) {
    return {
      ok: false,
      message: `Email domain not trusted. Use one of the following: ${TRUSTED_EMAIL_DOMAINS.join(
        ", "
      )}`,
    };
  }

  try {
    const data = await useCase.execute(email, request.order, request.direction);
    // revalidatePath("/my-domains", "page");
    return {
      ok: true,
      data: data.map(WatcherMapper.toDTO),
    };
  } catch (error) {
    return {
      ok: false,
      message: "No results found",
    };
  }
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

  revalidatePath("/my-domains");
  return { ok: true, data: WatcherMapper.toDTO(watcher) };
}

export async function removeDomain(
  _prevState: any,
  formData: FormData
): Promise<Response<null>> {
  try {
    const watcherId = formData.get("watcherId")?.toString();

    if (!watcherId) {
      return {
        ok: false,
        message: "You must specify a subscription ID",
      };
    }
    const useCase = new DeleteWatcherUseCase(new WatcherRepository());
    await useCase.execute(watcherId);
    revalidatePath("/my-domains");
    return {
      ok: true,
      data: null,
    };
  } catch (error) {
    return {
      ok: false,
      message: "There was an issue removing your subscription",
    };
  }
}
