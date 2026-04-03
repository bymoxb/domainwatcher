import { Box, Select, Tabs } from '@radix-ui/themes'
import { Heading } from '@radix-ui/themes/dist/cjs/components/index.js'
import { useState } from 'react'
import { Alert } from './components/detail'
import { DomainFilters } from './components/filters'
import Input from './components/input'
import { useQueryParams } from './hooks/useQueryParams.hook'
import { useSearchRegistry } from './hooks/useRegistry.hook'
import { useWatcher } from './hooks/useWatcher.hook'
import { DomainTable } from './temp/domain.table'



function App() {

  const { getQueryParam, setQueryParam } = useQueryParams()

  const [value, setValue] = useState<string>(getQueryParam("t"))

  return (
    <>
      <Heading size="6" weight="bold">
        DomainWatcher
      </Heading>

      <Tabs.Root defaultValue={value} onValueChange={(v) => {
        setValue(v)
        setQueryParam("t", v)
      }}>
        <Tabs.List>
          <Tabs.Trigger value="" >
            Seatch Domains
          </Tabs.Trigger>
          <Tabs.Trigger value="my-domains">
            My Domains
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value=''>
            <SearchDomain></SearchDomain>
          </Tabs.Content>

          <Tabs.Content value='my-domains'>
            <MyDomains></MyDomains>
          </Tabs.Content>
        </Box>

      </Tabs.Root>

    </>
  )
}

export default App

const SearchDomain = () => {

  const {
    loading,
    error,
    data,
    onSubmit,
  } = useSearchRegistry()

  return (
    <>
      <DomainFilters
        onSubmit={onSubmit}
      // startTransition={startTransition}
      // initialFilters={initialFilters}
      />

      {!loading && error && (
        <Alert title="Error" type="alert">
          {error}
        </Alert>
      )}

      <DomainTable
        loading={loading}
        data={{ registry: data, watcher: [] }}
      // data={data?.ok ? { registry: data.data, watcher: [] } : { watcher: [] }}
      />

    </>
  )
}

const MyDomains = () => {

  const { getQueryParam, setQueryParamFromForm, getFormDataFromQueryParams } = useQueryParams()

  const {
    data,
    error,
    loading,
    onSubmit,
  } = useWatcher(getFormDataFromQueryParams())

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          onSubmit(form)
          setQueryParamFromForm(form)
        }}
        className="gap-3 grid sm:grid-cols-3 md:grid-cols-5"
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
          className="md:col-span-3"
        // onChange={(value) => setForm((p) => ({ ...p, email: value }))}
        />

        <Select.Root
          name="order"
          defaultValue={getQueryParam("order")}
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
          defaultValue={getQueryParam("sort")}
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

        {/* <Button type="submit">Search</Button> */}
        {/* <div className="col-span-5">
        <pre>{JSON.stringify({ form })}</pre>
      </div> */}
      </form>

      {error && <Alert title="Error">{error}</Alert>}

      <DomainTable
        loading={loading}
        data={{ watcher: data }}
      />
    </>
  )
}
