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
