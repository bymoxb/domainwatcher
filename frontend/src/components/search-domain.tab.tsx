import { useSearchRegistry } from "@/hooks/useRegistry.hook"
import { Alert } from "./detail"
import { DomainTable } from "./domain.table"
import Input from "./input"

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
      >
        <Input
          autoFocus
          type="text"
          id="domain"
          name="domain"
          placeholder="Enter a domain name"
          required
        />
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