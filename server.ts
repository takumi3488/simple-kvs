import { Context, Hono } from "hono";

const kv = await Deno.openKv(Deno.env.get("KVS_PATH"));
const enableKeyList = Deno.env.get("ENABLE_KEY_LIST") === "true";

// root app
export const app = new Hono();
if (enableKeyList && (await kv.get([0])).value === null) {
  await kv.set([0], []);
  app.get("/", async (c) => {
    const response = await kv.get([0]);
    c.header("Content-Type", "application/json");
    return c.body(JSON.stringify(response.value));
  });
}

const keyRoute = new Hono();

// middleware to validate key
keyRoute.use(async (c, next) => {
  const key = c.req.param("key");
  if (key && !/^[a-zA-Z0-9_\-\.]+$/.test(key)) {
    c.status(400);
    return c.body("Invalid key");
  }
  await next();
});

// get value
keyRoute.get("/:key", async (c) => {
  const key = c.req.param("key");

  const response = await kv.get([key]);
  if (response === null || response.value === null) {
    c.status(404);
    return c.body("Not found");
  }

  const value = response.value;
  console.log({ value });
  switch (typeof value) {
    case "string": {
      c.header("Content-Type", "text/plain");
      return c.body(value);
    }
    case "object": {
      c.header("Content-Type", "application/json");
      return c.body(JSON.stringify(value));
    }
    default: {
      c.status(500);
      return c.body("Internal Server Error");
    }
  }
});

// store value
keyRoute.put("/:key", async (c) => {
  const response = await storeValue(c);
  if (response.status !== 204) {
    c.status(response.status);
    return c.body(null);
  }
  if (enableKeyList) {
    const key = c.req.param("key");
    const response = await kv.get([0]);
    const keys = response.value as string[];
    if (!keys.includes(key)) {
      keys.push(key);
      await kv.set([0], keys);
    }
  }
  c.status(204);
  return c.body(null);
});

// delete value
keyRoute.delete("/:key", async (c) => {
  const key = c.req.param("key");
  await kv.delete([key]);
  if (enableKeyList) {
    const response = await kv.get([0]);
    const keys = response.value as string[];
    const filteredKeys = keys.filter((k) => k !== key);
    await kv.set([0], filteredKeys);
  }
  c.status(204);
  return c.body(null);
});

// mount keyRoute to root app
app.route("/", keyRoute);
Deno.serve(app.fetch);

const storeValue = async (c: Context): Promise<{
  status: 204 | 400 | 500;
  body?: string;
}> => {
  const key = c.req.param("key");
  const value = await c.req.text();
  const contentType = c.req.header("content-type");
  switch (contentType) {
    case "text/plain": {
      switch (value) {
        case null: {
          const response = await kv.set([""], value);
          return response.ok
            ? {
              status: 204,
            }
            : {
              status: 500,
              body: "Internal Server Error",
            };
        }
        default: {
          const response = await kv.set([key], value);
          return response.ok
            ? {
              status: 204,
            }
            : {
              status: 500,
              body: "Internal Server Error",
            };
        }
      }
    }
    case "application/json": {
      try {
        const json = JSON.parse(value);
        const response = await kv.set([key], json);
        return response.ok
          ? {
            status: 204,
          }
          : {
            status: 500,
            body: "Internal Server Error",
          };
      } catch (_) {
        return {
          status: 400,
          body: "Invalid value",
        };
      }
    }
    default: {
      return {
        status: 400,
        body: "Invalid content type",
      };
    }
  }
};
