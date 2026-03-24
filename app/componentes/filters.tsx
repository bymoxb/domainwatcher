import { SearchDomainsForm } from "@/modules/watcher/application/dtos/WatcherResponse";
import { Select } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Input from "./input";

type SearchFormProps = {
  loading?: boolean;
  initialFilters?: SearchDomainsForm;
  startTransition: (callback: () => void) => void;
};

export const MyDomainFilters = ({
  loading,
  initialFilters,
  startTransition,
}: SearchFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    email: initialFilters?.email ?? "",
    order: initialFilters?.order ?? "expires",
    direction: initialFilters?.direction ?? "asc",
  });

  const onSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());

    // console.log({ formState: form });
    // console.log({ searchParams: searchParams.toString() });

    for (const key of Object.keys(form) as Array<keyof typeof form>) {
      const value = form[key];
      // console.log(`${key}=${value}`);
      params.set(key, value?.toString() ?? "");
    }

    // console.log({ params: params.toString() });
    // console.log({ isEquals: params.toString() == searchParams.toString() });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  useEffect(() => {
    if (loading) return;
    onSubmit();
  }, [form?.direction, form?.order]);

  return (
    <form
      action={onSubmit}
      className="gap-3 grid sm:grid-cols-3 md:grid-cols-5"
    >
      <Input
        autoFocus
        id="email"
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        value={form.email}
        className="md:col-span-3"
        onChange={(value) => setForm((p) => ({ ...p, email: value }))}
      />

      <Select.Root
        name="order"
        value={form.order}
        onValueChange={(value) => {
          setForm((p) => ({ ...p, order: value }));
        }}
      >
        <Select.Trigger placeholder="Order by" />
        <Select.Content>
          <Select.Group>
            <Select.Label>Order by</Select.Label>
            <Select.Item value="domain">Domain</Select.Item>
            <Select.Item value="expires">Expires In</Select.Item>
            <Select.Item value="notifi">Watching</Select.Item>
            <Select.Item value="added">Linked At</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Select.Root
        name="direction"
        value={form.direction}
        onValueChange={(value) => {
          setForm((p) => ({ ...p, direction: value }));
        }}
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
  );
};

type DomainFiltersProps = {
  initialFilters?: SearchDomainsForm;
  startTransition: (callback: () => void) => void;
};

export const DomainFilters = ({
  startTransition,
  initialFilters,
}: DomainFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmit = (formData: FormData) => {
    const params = new URLSearchParams(searchParams.toString());
    // const params = new URLSearchParams("");

    for (const key of formData.keys()) {
      const value = formData.get(key);
      params.set(key, value?.toString() ?? "");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form action={onSubmit}>
      <Input
        autoFocus
        type="text"
        id="domain"
        name="domain"
        placeholder="Enter a domain name"
        required
        defaultValue={initialFilters?.domain ?? ""}
      />
    </form>
  );
};
