"use client"
import { searchDomain } from "@/actions/registry.action";
import Button from "@/componentes/button";
import Detail from "@/componentes/detail";
import { DomainCard } from "@/componentes/domain.card";
import Input from "@/componentes/input";
import { useActionState } from "react";

export default function Home() {
  const [domainData, searchAction, isSearching] = useActionState(
    searchDomain,
    null
  );

  return (
    <main className="h-full gap-4 p-2">
      <form
        action={searchAction}
        className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        <Input
          type="text"
          id="domain"
          name="domain"
          placeholder="Enter a domain name"
          required
          className="sm:col-span-2 md:col-span-3 lg:col-span-4"
          defaultValue={domainData?.ok == true ? domainData.data.domain : ""}
        />
        <Button
          type="submit"
          disabled={isSearching}
          loading={isSearching}
          label={isSearching ? "Searching..." : "Search"}
        />
      </form>

      {domainData?.ok == false && (
        <Detail title="Error" type="danger" className="mt-2">
          {domainData.message}
        </Detail>
      )}

      {domainData?.ok && (
        <main className="mt-4 w-fit">
          <DomainCard data={domainData.data} actions={["notify"]} />
        </main>
      )}
    </main>
  );
}



