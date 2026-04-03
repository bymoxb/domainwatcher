"use client";

import { myDomains } from "@/actions/watcher.action";
import { SearchDomainsForm } from "@/modules/watcher/application/dtos/WatcherResponse";
import { Flex } from "@radix-ui/themes";
import { Suspense, useTransition } from "react";
import { Alert } from "../components/detail";
import { DomainTable } from "./domain.table";
import { MyDomainFilters } from "../components/filters";

export default function MyDomainsPage({
  data,
  initialFilters,
}: {
  data: Awaited<ReturnType<typeof myDomains>> | null;
  initialFilters?: SearchDomainsForm;
}) {
  const [loading, startTransition] = useTransition();

  return (
    <Flex gap="3" direction="column">
      <Suspense>
        <MyDomainFilters
          loading={loading}
          startTransition={startTransition}
          initialFilters={initialFilters}
        />
      </Suspense>

      {data?.ok == false && <Alert title="Error">{data.message}</Alert>}

      <DomainTable
        loading={loading}
        data={data?.ok ? { watcher: data.data } : { watcher: [] }}
      />
    </Flex>
  );
}
