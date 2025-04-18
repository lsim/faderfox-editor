

## Tasks

- `deno task dev` to start the server
- `deno task test` to run tests
- `deno task lint` to lint the code
- `deno task fmt` to format the code
- `deno task fmt --check` to check if the code is formatted
- To run the tests in watch mode, use `deno task test --watch`

## Deploy

To deploy the app, run `deno deploy --production`.

This will build the app and then deploy it to the cloud.

## TODO

- How to handle authentication?
  - Would be nice to have some kind of token-based authentication - like from github or google or whatever
  - Could roll our own with jwt https://docs.deno.com/examples/creating_and_verifying_jwt/
  - Maybe we can use the `Authorization` header to pass the token
  - We could also use the `Cookie` header to pass the token

