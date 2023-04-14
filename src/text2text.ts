import { WebSocket } from "ws";
const sessionHash = Math.floor(Math.random() * (2 ** 31 - 1) + 1);
const paramsFnIndex = 6;
const replyFnIndex = 7;

export type Txt2TxtConfig = {
  prompts: string[];
  sameSeed: boolean;
  params: Txt2TxtParams;
}

export type Txt2TxtParams = {
  max_new_tokens?: number;
  seed?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  typical_p?: number;
  repetition_penalty?: number;
  encoder_repetition_penalty?: number;
  no_repeat_ngram_size?: number;
  min_length?: number;
  do_sample?: boolean;
  penalty_alpha?: number;
  num_beams?: number;
  length_penalty?: number;
  early_stopping?: boolean;
  add_bos_token?: boolean;
  ban_bos_token?: boolean;
  truncation_length?: number;
  custom_stopping_strings?: string;

  [key: string]: string | number | boolean | undefined;
};

// Argument order is determined based upon the order they are defined in the gradio app config shown here: https://github.com/oobabooga/text-generation-webui/blob/28a11f57244f130f346b560cfd78bc0c47351e9a/server.py#L347-L406
let paramOrder = [
  "max_new_tokens", "seed", "temperature", "top_p", "top_k", "typical_p",
  "repetition_penalty", "encoder_repetition_penalty", "no_repeat_ngram_size",
  "min_length", "do_sample", "penalty_alpha", "num_beams", "length_penalty",
  "early_stopping", "add_bos_token", "ban_bos_token", "truncation_length",
  "custom_stopping_strings"
]

export function sendSessionHash(queue: WebSocket, fn_index: Number) {
  queue.send(JSON.stringify({ fn_index, session_hash: sessionHash }));
}

export function sendParameters(queue: WebSocket, data: Array<any>) {
  queue.send(JSON.stringify({ fn_index: paramsFnIndex, data, event_data: null, session_hash: sessionHash }));
}

export function sendPrompt(queue: WebSocket, prompt: string) {
  queue.send(JSON.stringify({ fn_index: replyFnIndex, data: [prompt, null], event_data: null, session_hash: sessionHash }));
  return prompt;
}

export function configureParameters(params: Txt2TxtParams, baseUrl: string): Promise<string> {
  let data: Array<any> = [];
  for (let i = 0, il = paramOrder.length; i < il; i++) {
    data.push(params[paramOrder[i]]);
  }
  const queue = new WebSocket(baseUrl);

  return new Promise((resolve, reject) => {
    queue.on('error', (err) => {
      console.error(err);
      reject(err);
    });

    queue.on('message', (dataStr) => {
      const message = JSON.parse(dataStr.toString());
      switch (message.msg) {
        case 'send_hash':
          sendSessionHash(queue, paramsFnIndex);
          break;
        case 'send_data':
          sendParameters(queue, data);
          break;
        case 'process_completed':
          resolve(message);
          break;
        case 'estimation':
        case 'process_starts':
        case 'process_generating':
          // noop
          break;
        default:
          console.warn(`unhandled event: ${dataStr}`);
      }
    });
  })
}

export function text2text(prompt: string, baseUrl: string): Promise<string> {
  const queue = new WebSocket(baseUrl);

  return new Promise((resolve, reject) => {
    queue.on('error', (err) => {
      console.error(err);
      reject(err);
    });

    queue.on('message', (dataStr) => {
      const message = JSON.parse(dataStr.toString());
      switch (message.msg) {
        case 'send_hash':
          sendSessionHash(queue, replyFnIndex);
          break;
        case 'send_data':
            sendPrompt(queue, prompt);
          break;
        case 'process_completed':
            resolve(message?.output?.data[0]);
          break;
        case 'estimation':
        case 'process_starts':
        case 'process_generating':
          // noop
          break;
        default:
          console.warn(`unhandled event: ${dataStr}`);
      }
    });
  })


}