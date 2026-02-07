import { watchDomain } from "@/actions/watcher.action";
import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
import { useActionState } from "react";
import Input from "./input";
import Button from "./button";

export function DomainCard({
  data,
  actions,
  isSubscribed,
}: {
  data: RegistryResponse,
  actions: Array<"notify" | "actions">,
  isSubscribed?: boolean;
}) {
  const [_, watchAction, isSubmitting] = useActionState(watchDomain, null);

  return (
    <main className="grid grid-cols-2 shadow-md p-4 rounded-xl">
      <span className="col-span-2 font-bold text-xl text-center font-mono">{data.domain}</span>
      <i className="col-span-2 border-t border-gray-400 my-2"></i>
      {/*  */}
      <span>Origin</span>
      <span>{data.origin}</span>
      {/*  */}
      <span>Created</span>
      <span>{(new Date(data.registryCreatedAt).toLocaleDateString())}</span>
      {/*  */}
      <span>Updated</span>
      <span>{data.registryUpdatedAt ? (new Date(data.registryUpdatedAt).toLocaleDateString()) : ""}</span>
      {/*  */}
      <span>Expires</span>
      <span>{(new Date(data.registryExpiresAt).toLocaleDateString())}</span>
      {/*  */}
      <span>Days left</span>
      <span>{calcDaysLeft(new Date(data.registryExpiresAt))}</span>
      {/*  */}
      {
        isSubscribed != undefined && (
          <>
            <span>Subscribed</span>
            <span>{isSubscribed ? "Yes" : "No"}</span>
          </>
        )
      }
      {/*  */}
      {/*  */}
      {/*  */}
      {
        actions.includes("notify") && (
          <form className="col-span-2 flex gap-2 mt-2" action={watchAction}>
            <Input type="hidden" name="registryId" value={data.id} />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter an email"
              className="border flex-1"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              label={isSubmitting ? "Saving" : "Notifyme"}
            />
          </form>
        )
      }
      {
        <div className="col-span-2 flex items-center text-center my-2 py-2 border-y border-gray-400">
          <a className="flex-1" href={`https://client.rdap.org/?type=domain&object=${data.domain}`} target="_blank" rel="noopener noreferrer">RDAP</a>
          <a className="flex-1" href={`https://who.is/whois/${data.domain}`} target="_blank" rel="noopener noreferrer">WHOIS</a>
        </div>
      }
      {
        (actions.includes("actions") && isSubscribed != undefined) && (
          <div className="col-span-2 flex items-center mx-auto my-2">
            {
              isSubscribed ?
                (<Button className="flex-1" label="Unsubscribe" />) :
                (<Button className="flex-1" label="Subscribe" />)
            }
          </div>
        )
      }
    </main>
  );
}

function calcDaysLeft(limit: Date): string {
  const now = new Date();
  const diff = limit.getTime() - now.getTime();
  return String(Math.round(diff / (1000 * 60 * 60 * 24)))
}
