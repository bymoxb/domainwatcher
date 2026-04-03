import { calcDaysLeft, safeDateString } from "@/libs/date";
import { buildRdapLink, buildWhoisLink } from "@/libs/links";
// import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
// import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
import type { RegistryResponse } from "@/types/registry.type";
import type { WatcherResponse } from "@/types/watcher.type";
import { Flex, Skeleton, Table } from "@radix-ui/themes";
import { ActionButtons, NotifyButton } from "../components/action.button";
import DaysBadge from "../components/days.badge";
import LinkButton from "../components/link.button";


type DomainTableItems = {
  watcher: WatcherResponse[];
  registry?: RegistryResponse | null;
};

export function DomainTable({
  data,
  loading,
}: {
  data: DomainTableItems;
  loading?: boolean;
}) {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell minWidth="120px">
            Domain
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell minWidth="120px">
            Registrar
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">
            Created on
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">
            Last updated
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">
            Expires on
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">
            Expires in
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">
            More detail
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="120px">Actions</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      {loading ? (
        <Table.Body>
          {[1, 2, 3, 4, 5].map((item) => (
            <Table.Row key={item}>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      ) : (
        <Table.Body>
          {(data.registry
            ? [{ registry: data.registry } as WatcherResponse]
            : data.watcher
          ).map((item, i) => (
            <Table.Row key={i}>
              <Table.RowHeaderCell>
                {item?.registry?.domain}
              </Table.RowHeaderCell>
              <Table.Cell>
                {item?.registry?.registrar}
              </Table.Cell>
              <Table.Cell>
                {safeDateString(item?.registry?.registryCreatedAt)}
              </Table.Cell>
              <Table.Cell>
                {safeDateString(item?.registry?.registryUpdatedAt)}
              </Table.Cell>
              <Table.Cell>
                {safeDateString(item?.registry?.registryExpiresAt)}
              </Table.Cell>
              <Table.Cell>
                <DaysBadge
                  days={calcDaysLeft(item?.registry?.registryExpiresAt)}
                />
              </Table.Cell>
              <Table.Cell>
                <Flex gap="1">
                  <LinkButton
                    href={buildRdapLink(item?.registry?.domain)}
                    text="RDAP"
                  />
                  <LinkButton
                    text="WHOIS"
                    href={buildWhoisLink(item?.registry?.domain)}
                  />
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Flex gap="2" justify="center">
                  {data.registry && <NotifyButton registry={data.registry} />}
                  {!data.registry && <ActionButtons key={i} watcher={item} />}
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      )}
    </Table.Root>
  );
}
