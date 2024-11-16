import { assertEquals } from "@std/assert";
import { app } from "./server.ts";

Deno.test("store text", async () => {
  const { status } = await app.request("/testKey", {
    method: "PUT",
    headers: {
      "content-type": "text/plain",
    },
    body: "stored text",
  });
  assertEquals(status, 204);
  const value = await (await app.request("/testKey")).text();
  assertEquals(value, "stored text");
  const keys = await (await app.request("/")).json();
  assertEquals(keys.includes("testKey"), true);
  await app.request("/testKey", { method: "DELETE" });
  const keys2 = await (await app.request("/")).json();
  assertEquals(keys2.includes("testKey"), false);
  const { status: status2 } = await app.request("/testKey");
  assertEquals(status2, 404);
});

Deno.test("store json", async () => {
  const { status } = await app.request("/testKey", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ a: 1 }),
  });
  assertEquals(status, 204);
  const value = await (await app.request("/testKey")).json();
  assertEquals(value["a"], 1);
});

Deno.test("store invalid json", async () => {
  const { status } = await app.request("/testKey", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: "invalid json",
  });
  assertEquals(status, 400);
});

Deno.test("store invalid content type", async () => {
  const { status } = await app.request("/testKey", {
    method: "PUT",
    headers: {
      "content-type": "application/xml",
    },
    body: "stored text",
  });
  assertEquals(status, 400);
});
