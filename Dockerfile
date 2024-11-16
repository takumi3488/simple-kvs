FROM denoland/deno:alpine-2.0.6

USER deno

WORKDIR /app

COPY . .
RUN deno cache server.ts

CMD ["run", "--unstable-kv", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "server.ts"]
