import { useEffect, useState } from "react";

export function useWatcher(defaultValues?: FormData) {

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (form: FormData) => {
    setLoading(true)
    try {

      for (const k of form.keys()) {
        console.log(`${k}=` + form.get(k));
      }

      const params = new URLSearchParams();

      params.append("email", form.get("email")?.toString() ?? "");
      params.append("order", form.get("order")?.toString() ?? "");
      params.append("sort", form.get("sort")?.toString() ?? "");

      const raw = await fetch("/api/watcher?" + params.toString())

      if (!raw.ok) {
        const result = await raw.json();
        setError(result["message"] ?? "No results found")
        return;
      }
      const data = await raw.json();
      setData(data["data"])
      setError(null)
    } catch (error) {
      setError("No results found")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!defaultValues) return
    if (!defaultValues.get("email")) return
    onSubmit(defaultValues)
  }, [])

  return {
    loading,
    data,
    error,
    onSubmit,
  }
}