import { myDomains } from "@/actions/watcher.action";
import MyDomainsPage from "@/componentes/my.domain.page";
import { SearchDomainsForm } from "@/modules/watcher/application/dtos/WatcherResponse";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchDomainsForm;
}) {
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof myDomains>> | null = null;

  if (params.email) {
    data = await myDomains({
      email: params.email,
      order: params.order,
      direction: params.direction,
    });
  }

  return <MyDomainsPage initialFilters={params} data={data} />;
}
