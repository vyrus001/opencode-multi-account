import test from "node:test"
import assert from "node:assert/strict"
import { migrateConfig } from "./config-schema.js"
import { applyAccountBaseUrl, resolveAccountBaseUrl } from "./provider-credentials.js"

test("preserves and normalizes an optional account base URL", () => {
  const { config } = migrateConfig({
    schemaVersion: 2,
    accounts: [{
      id: "proxy",
      name: "Proxy",
      provider: "openai",
      baseUrl: "https://proxy.example.test/v1/",
      apiKey: "secret",
      priority: 1,
    }],
  })

  assert.equal(config.accounts[0]?.baseUrl, "https://proxy.example.test/v1/")
  assert.equal(resolveAccountBaseUrl(config.accounts[0]!), "https://proxy.example.test/v1")
})

test("rejects non-HTTP account base URLs", () => {
  assert.equal(resolveAccountBaseUrl({
    id: "bad",
    name: "Bad",
    provider: "openai",
    baseUrl: "file:///tmp/provider",
    apiKey: "secret",
    priority: 1,
  }), undefined)
})


test("applies a valid account base URL to provider request options", () => {
  const options: Record<string, unknown> = {}
  applyAccountBaseUrl({
    id: "proxy",
    name: "Proxy",
    provider: "openai",
    baseUrl: "https://proxy.example.test/v1/",
    apiKey: "secret",
    priority: 1,
  }, options)
  assert.deepEqual(options, { baseURL: "https://proxy.example.test/v1" })
})
