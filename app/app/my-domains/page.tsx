"use client"
import { myDomains } from "@/actions/watcher.action";
import Button from "@/componentes/button";
import Detail from "@/componentes/detail";
import { DomainCard } from "@/componentes/domain.card";
import Input from "@/componentes/input";
import { useActionState } from "react";

export default function MyDomains() {
  const [data, searchAction, isSearching] = useActionState(myDomains, null);

  return (
    <main className="h-full flex flex-col gap-4">
      <form action={searchAction} className="flex gap-2">
        <Input
          type="text"
          id="email"
          name="email"
          placeholder="Enter an email"
          required
          className="flex-1"
        />

        <Button
          type="submit"
          disabled={isSearching}
          loading={isSearching}
          className=""
          label={isSearching ? "Searching" : "Search"}
        />

      </form>

      {
        data?.ok == true && !data.data.length && (
          <Detail className="">
            No domains assigned to email
          </Detail>
        )
      }

      {
        (data?.ok === true && data.data.length > 0) && (
          <section className="h-full overflow-scroll">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 m-2">
              {data.data.map(item => (
                <DomainCard
                  key={item.id}
                  data={item.registry!}
                  actions={["actions"]}
                  isSubscribed={item.notificationEnabled}
                />
              ))}
            </div>
          </section>
        )
      }
      {/* <pre>{JSON.stringify({ domainData: data }, null, 2)}</pre> */}

    </main>
  );
}
