import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateApiBaseUrl } from "../lib/api.ts";

describe("validateApiBaseUrl unit tests", () => {
  test("validateApiBaseUrl(undefined, 'production') throws", () => {
    assert.throws(
      () => validateApiBaseUrl(undefined, "production"),
      {
        name: "Error",
        message: /NEXT_PUBLIC_API_BASE_URL is not configured. In production mode, a valid backend API URL must be defined at build time./,
      }
    );
  });

  test("validateApiBaseUrl(undefined, 'development') returns the localhost default", () => {
    const result = validateApiBaseUrl(undefined, "development");
    assert.strictEqual(result, "http://localhost:8000/api/v1");
  });

  test("validateApiBaseUrl('https://api.example.com/', 'production') returns 'https://api.example.com' (trailing slash stripped)", () => {
    const result = validateApiBaseUrl("https://api.example.com/", "production");
    assert.strictEqual(result, "https://api.example.com");
  });
});
