import ConvertTOMK_Object from "./BaseLibConverter";
import { requireString } from "./RequireFunctions";

class Network {
  private defaultHeaders: Record<string, string> = {};

  /**
   * Sets multiple global headers.
   * @param headers An object containing header key-value pairs.
   */
  public SetHeaders(headers: any) {
    const nativeHeaders = this.toNative(headers);
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
    const v = String(this.toNative(value));
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
   * @param optionsOrCallback Optional request options or a callback function.
   */
  public async get(url: any, optionsOrCallback: any = {}) {
    const u = requireString(url);
    let options = optionsOrCallback;
    let callback: any = null;

    if (typeof optionsOrCallback === "function") {
      options = {};
      callback = optionsOrCallback;
    }

    try {
      const parsedOptions = this.parseOptions(options);
      const response = await fetch(u, {
        ...parsedOptions,
        headers: {
          ...this.defaultHeaders,
          ...parsedOptions.headers,
        },
      });
      const result = await this.parseResponse(response);

      if (callback) callback(result, null);
      return {
        data: result,
        error: null,
        ok: response.ok,
        status: response.status,
      };
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      if (callback) callback(null, errorMsg);
      return { data: null, error: errorMsg, ok: false, status: 0 };
    }
  }

  /**
   * Performs a POST request.
   * @param url The URL to request.
   * @param body The body of the request or a callback if no body provided.
   * @param optionsOrCallback Optional request options or a callback.
   */
  public async post(url: any, body: any, optionsOrCallback: any = {}) {
    const u = requireString(url);
    let bodyData = body;
    let options = optionsOrCallback;
    let callback: any = null;

    if (typeof body === "function") {
      bodyData = null;
      callback = body;
      options = {};
    } else if (typeof optionsOrCallback === "function") {
      options = {};
      callback = optionsOrCallback;
    }

    try {
      const parsedOptions = this.parseOptions(options);
      const response = await fetch(u, {
        ...parsedOptions,
        method: "POST",
        body: bodyData ? JSON.stringify(this.toNative(bodyData)) : null,
        headers: {
          "Content-Type": "application/json",
          ...this.defaultHeaders,
          ...parsedOptions.headers,
        },
      });
      const result = await this.parseResponse(response);

      if (callback) callback(result, null);
      return {
        data: result,
        error: null,
        ok: response.ok,
        status: response.status,
      };
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      if (callback) callback(null, errorMsg);
      return { data: null, error: errorMsg, ok: false, status: 0 };
    }
  }

  /**
   * Performs a PUT request.
   * @param url The URL to request.
   * @param body The body of the request.
   * @param optionsOrCallback Optional request options or a callback.
   */
  public async put(url: any, body: any, optionsOrCallback: any = {}) {
    const u = requireString(url);
    let bodyData = body;
    let options = optionsOrCallback;
    let callback: any = null;

    if (typeof body === "function") {
      bodyData = null;
      callback = body;
      options = {};
    } else if (typeof optionsOrCallback === "function") {
      options = {};
      callback = optionsOrCallback;
    }

    try {
      const parsedOptions = this.parseOptions(options);
      const response = await fetch(u, {
        ...parsedOptions,
        method: "PUT",
        body: bodyData ? JSON.stringify(this.toNative(bodyData)) : null,
        headers: {
          "Content-Type": "application/json",
          ...this.defaultHeaders,
          ...parsedOptions.headers,
        },
      });
      const result = await this.parseResponse(response);

      if (callback) callback(result, null);
      return {
        data: result,
        error: null,
        ok: response.ok,
        status: response.status,
      };
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      if (callback) callback(null, errorMsg);
      return { data: null, error: errorMsg, ok: false, status: 0 };
    }
  }

  /**
   * Performs a DELETE request.
   * @param url The URL to request.
   * @param optionsOrCallback Optional request options or a callback.
   */
  public async delete(url: any, optionsOrCallback: any = {}) {
    const u = requireString(url);
    let options = optionsOrCallback;
    let callback: any = null;

    if (typeof optionsOrCallback === "function") {
      options = {};
      callback = optionsOrCallback;
    }

    try {
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

      if (callback) callback(result, null);
      return {
        data: result,
        error: null,
        ok: response.ok,
        status: response.status,
      };
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      if (callback) callback(null, errorMsg);
      return { data: null, error: errorMsg, ok: false, status: 0 };
    }
  }

  /**
   * Performs a PATCH request.
   * @param url The URL to request.
   * @param body The body of the request.
   * @param optionsOrCallback Optional request options or a callback.
   */
  public async patch(url: any, body: any, optionsOrCallback: any = {}) {
    const u = requireString(url);
    let bodyData = body;
    let options = optionsOrCallback;
    let callback: any = null;

    if (typeof body === "function") {
      bodyData = null;
      callback = body;
      options = {};
    } else if (typeof optionsOrCallback === "function") {
      options = {};
      callback = optionsOrCallback;
    }

    try {
      const parsedOptions = this.parseOptions(options);
      const response = await fetch(u, {
        ...parsedOptions,
        method: "PATCH",
        body: bodyData ? JSON.stringify(this.toNative(bodyData)) : null,
        headers: {
          "Content-Type": "application/json",
          ...this.defaultHeaders,
          ...parsedOptions.headers,
        },
      });
      const result = await this.parseResponse(response);

      if (callback) callback(result, null);
      return {
        data: result,
        error: null,
        ok: response.ok,
        status: response.status,
      };
    } catch (e: any) {
      const errorMsg = e.message || String(e);
      if (callback) callback(null, errorMsg);
      return { data: null, error: errorMsg, ok: false, status: 0 };
    }
  }

  /**
   * Performs a HEAD request.
   * @param url The URL to request.
   * @param options Optional request options.
   */
  public async head(url: any, options: any = {}) {
    const u = requireString(url);
    try {
      const parsedOptions = this.parseOptions(options);
      const response = await fetch(u, {
        ...parsedOptions,
        method: "HEAD",
        headers: {
          ...this.defaultHeaders,
          ...parsedOptions.headers,
        },
      });
      return Object.fromEntries(response.headers.entries());
    } catch (e: any) {
      return { error: e.message || String(e) };
    }
  }

  private parseOptions(options: any) {
    if (!options) return {};
    const native = this.toNative(options);
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

  /**
   * Converts a CursorScript RuntimeValue to a native JavaScript value.
   */
  private toNative(val: any): any {
    if (val === null || val === undefined) return null;

    // Handle primitives that have been extracted by BaseLibConverter
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean" ||
      typeof val === "function"
    ) {
      return val;
    }

    // Handle RuntimeValues
    if (
      val.type === "number" ||
      val.type === "string" ||
      val.type === "boolean"
    ) {
      return val.value;
    }

    if (val.type === "null") {
      return null;
    }

    if (val.type === "array") {
      return val.elements.map((el: any) => this.toNative(el));
    }

    if (val.type === "object") {
      const obj: any = {};
      for (const [key, value] of val.properties) {
        obj[key] = this.toNative(value);
      }
      return obj;
    }

    return val;
  }
}

export const NetworkL = ConvertTOMK_Object(new Network());
