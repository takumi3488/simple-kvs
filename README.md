# simple-kvs

Provides a simple KVS using SQLite and its HTTP endpoint.

## Usage

Start using deno cli or docker.

### `GET /{key}`

Returns status code 200 and value if key is in kvs, otherwise returns status
code 404

### `PUT /{key}`

Upserts the request body to the key. key can contain alphanumeric characters
(case-insensitive), periods, hyphens, and underscores.

When Content-Type is text/plain:

- If there is a request body, it is stored as a string.
- If there is no request body, an empty string is stored.

When Content-Type is application/json:

- If the request body can be interpreted as json, it is stored as json.
- Otherwise, the status code 400 is returned.

If the request is successful, status code 204 is returned.

### `DELETE /{key}`

Delete key in kvs.

## Environment variables

`KVS_PATH`: Specifies the path to the SQLite file. If not specified, see
[Deno KV Documentation](https://docs.deno.com/deploy/kv/manual/).

`ENABLE_KEY_LIST`: If “true”, provides an endpoint to retrieve a list of keys.
Do not set this to “true” unless the number of keys is small, such as in the
case of a master key.
