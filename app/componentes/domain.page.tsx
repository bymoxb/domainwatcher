"use client";
import { searchDomain } from "@/actions/registry.action";
import { SearchDomainsForm } from "@/modules/watcher/application/dtos/WatcherResponse";
import { Flex } from "@radix-ui/themes";
import { Alert } from "./detail";
import { DomainTable } from "./domain.card";
import { DomainFilters } from "./filters";
import { Suspense, useTransition } from "react";

export default function DomainPage({
  data,
  initialFilters,
}: {
  data: Awaited<ReturnType<typeof searchDomain>> | null;
  initialFilters?: SearchDomainsForm;
}) {
  const [loading, startTransition] = useTransition();
  return (
    <Flex gap="3" direction="column">
      <Suspense>
        <DomainFilters
          startTransition={startTransition}
          initialFilters={initialFilters}
        />
      </Suspense>

      {data?.ok == false && (
        <Alert title="Error" type="alert">
          {data.message}
        </Alert>
      )}

      <DomainTable
        loading={loading}
        data={data?.ok ? { registry: data.data, watcher: [] } : { watcher: [] }}
      />
    </Flex>
  );
}
