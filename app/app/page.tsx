import { searchDomain } from "@/actions/registry.action";
import DomainPage from "@/componentes/domain.page";
import { SearchDomainsForm } from "@/modules/watcher/application/dtos/WatcherResponse";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchDomainsForm;
}) {
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof searchDomain>> | null = null;

  if (params.domain) {
    data = await searchDomain(params.domain);
  }

  return <DomainPage data={data} initialFilters={params} />;
}
