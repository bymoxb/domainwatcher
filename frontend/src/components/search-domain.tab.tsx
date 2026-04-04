import { useSearchRegistry } from "@/hooks/useRegistry.hook"
import { Alert } from "./detail"
import { DomainTable } from "./domain.table"
import Input from "./input"
import { Button } from "@radix-ui/themes"

const SearchDomain = () => {

  const {
    loading,
    error,
    data,
    onSubmit,
  } = useSearchRegistry()

  return (
    <main className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(new FormData(e.currentTarget))
        }}
        className="gap-2 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6"
      >
        <Input
          autoFocus
          type="text"
          id="domain"
          name="domain"
          placeholder="Enter a domain name"
          required
          className="sm:col-span-2 md:col-span-4 lg:col-span-5"
        />
        <Button loading={loading} disabled={loading} type="submit">Search</Button>
      </form>

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

    </main>
  )
}

export default SearchDomain