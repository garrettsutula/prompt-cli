# prompt-cli
A cli tool for organzing and running prompts agains the [VoltaML Fast Stable Diffusion](https://github.com/VoltaML/voltaML-fast-stable-diffusion) API and [Text Generation Web UI](https://github.com/oobabooga/text-generation-webui) websocket API.

## Project Structure
```
.
├── input/
│   └── *.yaml
├── schemas/
│   └── prompt.schema.json - schema file for prompt input yamls
├── src/
│   └── ... Project files for the magic prompt cli tool
├── package.json
└── README.md - You Are Here
```

## Getting Started

1. Clone this Repository.
2. Run `npm i` to install project dependencies.
3. Run `npm run build` to build the project.
4. Run the script locally like `node ./dist/app.js --input "./input/txt2txt/test.yaml"`

## CLI Args

| Flag                                                        | Default                          | Description |
|-------------------------------------------------------------|----------------------------------|-------------|
| `--inputPath PATH`                                                  |                                  | Pass the desired prompt configuration e.g. `./input/txt2txt/test.yaml` |
| `--baseUrl BASE_URL`                                        | `ws://127.0.0.1:7860/queue/join` | the websocket "join" URL |