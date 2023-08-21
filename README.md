# poc-probot

> A GitHub App built with [Probot](https://github.com/probot/probot) that Prueba de concepto

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t poc-probot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> poc-probot
```

## Contributing

If you have suggestions for how poc-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Others

- [Playground de Github para graphql](https://docs.github.com/es/graphql/guides/using-the-explorer)
