FROM denoland/deno:alpine-2.4.5

USER deno

WORKDIR /app

COPY . .
RUN deno cache serve.ts

CMD ["run", "--unstable-kv", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "serve.ts"]
