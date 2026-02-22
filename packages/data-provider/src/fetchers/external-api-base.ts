export interface ExternalAPIConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface APIResponse<TData> {
  data: TData;
  status: number;
  headers?: Headers;
}

export interface APIErrorOptions {
  message: string;
  status?: number;
  code?: string;
}

export class ExternalAPIBase {
  protected baseUrl: string;
  protected apiKey?: string;
  protected timeout: number;

  constructor(config: ExternalAPIConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 5000;
  }

  protected async request<TData>(
    path: string,
    options: RequestInit = {},
  ): Promise<APIResponse<TData>> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.buildHeaders(options.headers);

    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await globalThis.fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      globalThis.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError({
          message: `Request failed: ${response.statusText}`,
          status: response.status,
        });
      }

      const data = await response.json() as TData;

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    }
    catch (error) {
      globalThis.clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError({
          message: `Request timeout after ${this.timeout}ms`,
          code: 'TIMEOUT',
        });
      }

      throw new APIError({
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UNKNOWN',
      });
    }
  }

  protected buildHeaders(inputHeaders?: HeadersInit): Headers {
    const headers = new Headers(inputHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }

    return headers;
  }

  protected async get<TData>(path: string): Promise<TData> {
    const response = await this.request<TData>(path, { method: 'GET' });
    return response.data;
  }

  protected async post<TData>(path: string, body: unknown): Promise<TData> {
    const response = await this.request<TData>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.data;
  }
}

export class APIError extends Error {
  public status?: number;
  public code?: string;

  constructor({ message, status, code }: APIErrorOptions) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}
