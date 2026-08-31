FROM denoland/deno:alpine-2.4.5@sha256:a49d8fc2e5abf594509a70b008dea4c671ccf54d7c3a978602bb6ee4ca04dcf3

USER deno

WORKDIR /app

COPY . .
RUN deno cache serve.ts

CMD ["run", "--unstable-kv", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "serve.ts"]
