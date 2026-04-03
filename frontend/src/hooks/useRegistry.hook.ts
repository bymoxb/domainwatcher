import type { RegistryResponse } from "@/types/registry.type";
import { useState } from "react";

export function useSearchRegistry() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<RegistryResponse | null>()
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (form: FormData) => {
        try {
            setLoading(true)
            const raw = await fetch("/api/registry?domain=" + form.get("domain"))

            if (!raw.ok) {
                const result = await raw.json()
                setError(result["message"])
                return;
            }

            const result = await raw.json()

            setError(null)
            setData(result["data"])
        } catch (error) {
            setError("Unknown error try later")
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        data,
        onSubmit
    }
}