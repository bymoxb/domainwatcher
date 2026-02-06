"use client"
import { searchDomain } from "@/actions/registry.action";
import Button from "@/componentes/button";
import { DomainCard } from "@/componentes/domain.card";
import Input from "@/componentes/input";
import { useActionState } from "react";

export default function Home() {
  const [domainData, searchAction, isSearching] = useActionState(searchDomain, null);

  return (
    <main className="h-full">
      <form action={searchAction} className="flex gap-2">
        <Input
          type="text"
          id="domain"
          name="domain"
          placeholder="Enter a domain"
          required
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSearching}
          loading={isSearching}
          // className="border px-2 py-1 rounded-xl cursor-pointer"
          label={isSearching ? "Searching" : "Search"}
        />


      </form>

      {
        domainData?.ok == false && (
          <span>Error: {domainData.message}</span>
        )
      }

      {
        domainData?.ok && (
          <main className="mt-4 w-fit">
            <DomainCard data={domainData.data} actions={["notify"]} />
          </main>
        )
      }
    </main>
  );
}



