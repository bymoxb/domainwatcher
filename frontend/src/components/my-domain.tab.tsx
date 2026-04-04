import { useQueryParams } from "@/hooks/useQueryParams.hook"
import { useWatcher } from "@/hooks/useWatcher.hook"
import { Button, Select } from "@radix-ui/themes"
import { Alert } from "./detail"
import { DomainTable } from "./domain.table"
import Input from "./input"

const MyDomains = () => {

  const { getQueryParam, setQueryParamFromForm, getFormDataFromQueryParams } = useQueryParams()

  const {
    data,
    error,
    loading,
    onSubmit,
    refresh,
  } = useWatcher(getFormDataFromQueryParams())

  return (
    <main className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          onSubmit(form)
          setQueryParamFromForm(form)
        }}
        className="gap-2 grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      >
        <Input
          autoFocus
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          defaultValue={getQueryParam("email")}
          // value={form.email}
          className="md:col-span-2 lg:col-end-3"
        // onChange={(value) => setForm((p) => ({ ...p, email: value }))}
        />

        <Select.Root
          name="order"
          defaultValue={getQueryParam("order", "expires")}
        // value={form.order}
        // onValueChange={(value) => {
        //   setForm((p) => ({ ...p, order: value }));
        // }}
        >
          <Select.Trigger placeholder="Order by" />
          <Select.Content>
            <Select.Group>
              <Select.Label>Order by</Select.Label>
              <Select.Item value="domain">Domain</Select.Item>
              <Select.Item value="expires">Expires In</Select.Item>
              <Select.Item value="notification_status">Watching</Select.Item>
              <Select.Item value="created">Linked At</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <Select.Root
          name="sort"
          defaultValue={getQueryParam("sort","asc")}
        // value={form.direction}
        // onValueChange={(value) => {
        //   setForm((p) => ({ ...p, direction: value }));
        // }}
        >
          <Select.Trigger placeholder="Direction" />
          <Select.Content>
            <Select.Group>
              <Select.Label>Direction</Select.Label>
              <Select.Item value="desc">Desc</Select.Item>
              <Select.Item value="asc">Asc</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <Button loading={loading} disabled={loading} type="submit">Search</Button>
      </form>

      {error && <Alert title="Error">{error}</Alert>}

      <DomainTable
        refresh={refresh}
        loading={loading}
        data={{ watcher: data }}
      />
    </main>
  )
}


export default MyDomains