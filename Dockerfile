FROM denoland/deno:alpine-2.4.3

USER deno

WORKDIR /app

COPY . .
RUN deno cache serve.ts

CMD ["run", "--unstable-kv", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "serve.ts"]
