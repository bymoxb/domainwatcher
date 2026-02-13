export type HttpResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
      data: null;
    };

export interface HttpClientPort {
  get<T>(
    url: string | URL,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;
  post<T>(
    url: string,
    body: any,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>>;
}

export class HttpClient implements HttpClientPort {
  constructor(private readonly defaultTimeoutMs: number = 5000) {
    console.log("HttpClient DEFAULT_TIMEOUT_MS: " + defaultTimeoutMs);
  }

  private async fetcher<T>(
    url: string | URL,
    options: RequestInit = {},
    timeoutMs?: number
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      timeoutMs ?? this.defaultTimeoutMs
    );

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });

      clearTimeout(timeout);

      if (!res.ok) {
        return {
          ok: false,
          data: null,
          message: `HttpClient request to ${url} failed statusCode: ${res.status}`,
        };
      }

      const data: T = await res.json();
      return { ok: true, data };
    } catch (err: any) {
      clearTimeout(timeout);
      let message = "";
      if (err.name === "AbortError") {
        message = `HttpClient request to ${url} timed out after ${
          timeoutMs ?? this.defaultTimeoutMs
        }ms`;
      } else {
        message = `HttpClient request to ${url} failed: ${err}`;
      }
      return { ok: false, data: null, message };
    }
  }

  async get<T>(
    url: string | URL,
    headers: Record<string, string> = {},
    timeoutMs?: number
  ): Promise<HttpResponse<T>> {
    return this.fetcher<T>(url, { method: "GET", headers }, timeoutMs);
  }

  post<T>(
    url: string,
    body: any,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    throw new Error("Method not implemented.");
  }
}
