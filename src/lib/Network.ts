import ConvertTOMK_Object from "./BaseLibConverter";
import { requireString } from "./RequireFunctions";
import { toNative } from "./Utils";

class Network {
  private defaultHeaders: Record<string, string> = {};

  /**
   * Sets multiple global headers.
   * @param headers An object containing header key-value pairs.
   */
  public SetHeaders(headers: any) {
    const nativeHeaders = toNative(headers);
    if (typeof nativeHeaders === "object" && nativeHeaders !== null) {
      this.defaultHeaders = { ...this.defaultHeaders, ...nativeHeaders };
    }
  }

  /**
   * Adds a single global header.
   * @param key The header name.
   * @param value The header value.
   */
  public AddHeader(key: any, value: any) {
    const k = requireString(key);
    const v = String(toNative(value));
    this.defaultHeaders[k] = v;
  }

  /**
   * Clears all global headers.
   */
  public ClearHeaders() {
    this.defaultHeaders = {};
  }

  /**
   * Performs a GET request.
   * @param url The URL to request.
   * @param options Optional request options.
   */
  public async get(url: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      headers: {
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    const result = await this.parseResponse(response);

    if (!response.ok) {
      throw `GET request failed with status ${response.status}: ${JSON.stringify(result)}`;
    }
    return result;
  }

  /**
   * Performs a POST request.
   * @param url The URL to request.
   * @param body The body of the request.
   * @param options Optional request options.
   */
  public async post(url: any, body: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      method: "POST",
      body: body ? JSON.stringify(toNative(body)) : null,
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    const result = await this.parseResponse(response);

    if (!response.ok) {
      throw `POST request failed with status ${response.status}: ${JSON.stringify(result)}`;
    }
    return result;
  }

  /**
   * Performs a PUT request.
   * @param url The URL to request.
   * @param body The body of the request.
   * @param options Optional request options.
   */
  public async put(url: any, body: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      method: "PUT",
      body: body ? JSON.stringify(toNative(body)) : null,
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    const result = await this.parseResponse(response);

    if (!response.ok) {
      throw `PUT request failed with status ${response.status}: ${JSON.stringify(result)}`;
    }
    return result;
  }

  /**
   * Performs a DELETE request.
   * @param url The URL to request.
   * @param options Optional request options.
   */
  public async delete(url: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      method: "DELETE",
      headers: {
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    const result = await this.parseResponse(response);

    if (!response.ok) {
      throw `DELETE request failed with status ${response.status}: ${JSON.stringify(result)}`;
    }
    return result;
  }

  /**
   * Performs a PATCH request.
   * @param url The URL to request.
   * @param body The body of the request.
   * @param options Optional request options.
   */
  public async patch(url: any, body: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      method: "PATCH",
      body: body ? JSON.stringify(toNative(body)) : null,
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    const result = await this.parseResponse(response);

    if (!response.ok) {
      throw `PATCH request failed with status ${response.status}: ${JSON.stringify(result)}`;
    }
    return result;
  }

  /**
   * Performs a HEAD request.
   * @param url The URL to request.
   * @param options Optional request options.
   */
  public async head(url: any, options: any = {}) {
    const u = requireString(url);
    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      method: "HEAD",
      headers: {
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });
    if (!response.ok) {
      throw `HEAD request failed with status ${response.status}`;
    }
    return Object.fromEntries(response.headers.entries());
  }

  /**
   * Performs a streaming request, typically used for Server-Sent Events (SSE).
   * @param url The URL to request.
   * @param options Optional request options.
   * @param onChunk A callback function invoked for each chunk of data received.
   */
  public async stream(url: any, options: any = {}, onChunk: any) {
    const u = requireString(url);
    if (typeof onChunk !== "function") {
      throw "onChunk must be a function";
    }

    const parsedOptions = this.parseOptions(options);
    const response = await fetch(u, {
      ...parsedOptions,
      headers: {
        Accept: "text/event-stream",
        ...this.defaultHeaders,
        ...parsedOptions.headers,
      },
    });

    if (!response.ok) {
      throw `Stream request failed with status ${response.status}, ${response.statusText}, body: ${await response.body?.text()}`;
    }

    if (!response.body) {
      throw "Response body is empty or not readable";
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        // Call the user-provided callback
        onChunk(chunk);
      }
    } finally {
      reader.releaseLock();
    }
    return null;
  }

  private parseOptions(options: any) {
    if (!options) return {};
    const native = toNative(options);
    return typeof native === "object" && native !== null ? native : {};
  }

  private async parseResponse(response: Response) {
    const contentType = response.headers.get("content-type");
    try {
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (e) {
      return null;
    }
  }
}

export const NetworkL = ConvertTOMK_Object(new Network());
