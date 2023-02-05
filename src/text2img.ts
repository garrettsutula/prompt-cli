import axios from 'axios';
import { getRandomInt } from './random';
import { Agent } from 'https';
import { readFileSync } from 'fs';

export type Txt2ImgPayload = {
 id?: string;
 prompt: string;
 negative_prompt: string;
 width: number;
 height: number;
 steps: number;
 guidance_scale: number;
 seed?: number;
 batch_size: number;
 batch_count: number;
}

export type Txt2ImgEnvelope = {
 data: Txt2ImgPayload;
 model: string;
 scheduler: number;
 backend: string;
 autoload: boolean;
 save_image: boolean
}

const httpsAgent = new Agent({
   rejectUnauthorized: false,
});

export async function generateImage(payload: Txt2ImgPayload, model: string, baseUrl: string) {
   // check for and load model if necessary
   if (model) await loadModel(model, baseUrl);
   payload.id = payload.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + Date.now().toString();
   payload.seed = getRandomInt();
   return axios.post(`${baseUrl}/api/txt2img/generate`, {
      data: payload,
      model,
      scheduler: 7,
      backend: 'TensorRT',
      save_image: true,
    }, { httpsAgent });
}

export async function getLoadedModel(baseUrl: string) {
   const { data }: any = await axios.get(`${baseUrl}/api/models/loaded`, { httpsAgent });
   if (data['0'] && data['0'].length) return data['0'][0] as string;
}

export async function loadModel(model: string, baseUrl: string) {
   let currentModel = await getLoadedModel(baseUrl);
   if (currentModel && currentModel !== model) {
      await unloadModels(baseUrl);
      currentModel = undefined;
   }
   if (!currentModel) {
      return axios.post(`${baseUrl}/api/models/load?model=${model}&backend=TensorRT`, undefined,{ httpsAgent });
   }
}

function unloadModels(baseUrl: string) {
 return axios.post(`${baseUrl}/api/models/unload-all`, undefined, { httpsAgent });
}