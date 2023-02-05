import axios from 'axios';
import { getRandomInt } from './random';
import { Agent } from 'https';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export enum Sampler {
   DDIM = 1,
   DDPM = 2,
   PNDM = 3,
   LMSD = 4,
   EULER = 5,
   HEUN = 6,
   EULER_A = 7,
   DPM_2M = 8,
   DPM_2S = 9,
   DPM_SDE = 10,
   DPM_2S_A_KARRAS = 11,
   DEIS = 12,
 }

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
   if (!payload.id) payload.id = uuidv4();
   if (!payload.seed) payload.seed = getRandomInt();
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