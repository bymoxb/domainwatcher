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
    <main className="h-full flex flex-col gap-4 overflow-hidden p-2">
      <form action={searchAction} className="flex gap-2">
        <Input
          type="text"
          id="email"
          name="email"
          placeholder="Enter an email"
          required
          defaultValue={data?.ok == true ? data.data.email : ""}
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
        data?.ok == false && (
          <Detail className="">
            {data.message}
          </Detail>
        )
      }

      {
        data?.ok == true && !data.data.items.length && (
          <Detail className="">
            No domains assigned to email
          </Detail>
        )
      }

      {
        (data?.ok === true && data.data.items.length > 0) && (
          <section className="h-full overflow-scroll">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {data.data.items.map(item => (
                <DomainCard
                  key={item.id}
                  data={item}
                  actions={["actions"]}
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
