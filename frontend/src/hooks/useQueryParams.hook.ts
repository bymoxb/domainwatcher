export function useQueryParams() {

  const getQueryParam = (key: string, defaultValue: string = ""): string => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get(key) ?? defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  const setQueryParam = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  }

  const setQueryParamFromForm = (form: FormData) => {
    const url = new URL(window.location.href);
    for (const k of form.keys()) {
      url.searchParams.set(k, form.get(k)?.toString() ?? "");
    }
    window.history.pushState({}, '', url);
  }

  const getFormDataFromQueryParams = (): FormData => {
    const formData = new FormData();
    const url = new URL(window.location.href);

    // Recorremos los parámetros de la URL y los agregamos al FormData
    url.searchParams.forEach((value, key) => {
      formData.append(key, value);
    });

    return formData;
  };

  return {
    setQueryParam,
    getQueryParam,
    setQueryParamFromForm,
    getFormDataFromQueryParams,
  }
}