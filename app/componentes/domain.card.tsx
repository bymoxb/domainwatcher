import { watchDomain } from "@/actions/watcher.action";
import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
import { useActionState, useOptimistic } from "react";
import ActionButtons from "./action.button";
import Button from "./button";
import Input from "./input";
import LinkButton from "./link.button";

export function DomainCard({
  data,
  actions,
}: {
  data: RegistryResponse | WatcherResponse;
  actions: Array<"notify" | "actions">;
}) {
  const [_, watchAction, isSubmitting] = useActionState(watchDomain, null);
  useOptimistic;

  let registry: RegistryResponse | null = null;
  let watcher: WatcherResponse | null = null;

  if (data.type == "registry") {
    registry = data;
  } else if (data.type == "watcher") {
    watcher = data;
    registry = data.registry;
  }

  if (!registry) {
    return <></>;
  }

  return (
    <main className="grid grid-cols-2 gap-x-2 shadow-md p-4 rounded-xl">
      <span className="col-span-2 font-bold text-xl text-center font-mono">
        {registry.domain}
      </span>
      <i className="col-span-2 border-t border-gray-400 my-2"></i>
      {/*  */}
      {/* <span>Origin</span>
      <span>{registry.origin}</span> */}
      {/*  */}
      <span>Created on</span>
      <span>{new Date(registry.registryCreatedAt).toLocaleDateString()}</span>
      {/*  */}
      <span>Last updated</span>
      <span>
        {registry.registryUpdatedAt
          ? new Date(registry.registryUpdatedAt).toLocaleDateString()
          : ""}
      </span>
      {/*  */}
      <span>Expires on</span>
      <span>{new Date(registry.registryExpiresAt).toLocaleDateString()}</span>
      {/*  */}
      <span>Expires in</span>
      <span>{calcDaysLeft(new Date(registry.registryExpiresAt))}</span>
      {/*  */}
      {/* {watcher != null && (
        <>
          <span>Subscribed</span>
          <span>{watcher.notificationEnabled ? "Yes" : "No"}</span>
        </>
      )} */}
      {/*  */}
      {/*  */}
      {/*  */}
      {actions.includes("notify") && (
        <form
          className="col-span-2 w-full grid sm:grid-cols-2 gap-2 mt-2"
          action={watchAction}
        >
          <Input type="hidden" name="registryId" value={data.id} />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="flex-1"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            label={isSubmitting ? "Please wait..." : "Get notified"}
          />
        </form>
      )}
      {
        <div className="col-span-2 flex items-center text-center my-2 py-2 border-y border-gray-400">
          <LinkButton
            href={`https://client.rdap.org/?type=domain&object=${registry.domain}`}
            text="RDAP"
          />
          <LinkButton
            text="WHOIS"
            href={`https://who.is/whois/${registry.domain}`}
          />
        </div>
      }
      {actions.includes("actions") && watcher != null && (
        <div className="col-span-2 w-full my-2">
          <ActionButtons watcher={watcher} />
        </div>
      )}
    </main>
  );
}

function calcDaysLeft(limit: Date): string {
  const now = new Date();
  const diff = limit.getTime() - now.getTime();
  return String(Math.round(diff / (1000 * 60 * 60 * 24)));
}
