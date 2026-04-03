import { Select } from "@radix-ui/themes";
import { useActionState, useEffect, useState } from "react";
import Input from "./input";

type SearchDomainsForm = any

type SearchFormProps = {
  loading?: boolean;
  initialFilters?: SearchDomainsForm;
  startTransition?: (callback: () => void) => void | void;
};

type DomainFiltersProps = {
  initialFilters?: SearchDomainsForm;
  onSubmit: (form: FormData) => void
};

export const DomainFilters = ({
  initialFilters,
  onSubmit,
}: DomainFiltersProps) => {
  // const router = useRouter();
  // const searchParams = useSearchParams();

  // const onSubmit = (formData: FormData) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   // const params = new URLSearchParams("");

  //   for (const key of formData.keys()) {
  //     const value = formData.get(key);
  //     params.set(key, value?.toString() ?? "");
  //   }

  //   startTransition(() => {
  //     router.push(`?${params.toString()}`);
  //   });
  // };

  return (
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
        defaultValue={initialFilters?.domain ?? ""}
      />
    </form>
  );
};
