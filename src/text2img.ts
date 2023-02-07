import axios from 'axios';
import { getRandomInt } from './random';
import { Agent } from 'https';
import { randomUUID } from 'crypto';

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

export type Txt2ImgInput = {
   id?: string;
   seed?: number;
   prompts: string[];
   prompt: string;
   negative: string;
   model: string;
   output: {
      sampler: string;
      steps: number;
      width: number,
      height: number,
      cfg: number,
   },
   batch: {
      count: number,
      size: number,
   }
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

export async function generateImage(input: Txt2ImgInput, baseUrl: string) {
   const {
      id,
      seed,
      prompt,
      negative: negative_prompt,
      model,
      output: {
         sampler,
         steps = 20,
         width = 512,
         height = 512,
         cfg: guidance_scale = 7,
      },
      batch: {
         count: batch_count,
         size: batch_size,
      },
   } = input;
   const payload: Txt2ImgPayload = {
      id,
      seed,
      prompt,
      negative_prompt,
      width,
      height,
      steps,
      guidance_scale,
      batch_count,
      batch_size,
   };
   const scheduler = (<any>Sampler)[sampler] || 7;
   // check for and load model if necessary
   if (model) await loadModel(model, baseUrl);
   if (!payload.id) payload.id = randomUUID();
   if (!payload.seed) payload.seed = getRandomInt();
   return axios.post(`${baseUrl}/api/txt2img/generate`, {
      data: payload,
      model,
      scheduler,
      backend: 'TensorRT',
      save_image: true,
   }, { httpsAgent });
}

export async function getLoadedModel(baseUrl: string) {
   const { data }: any = await axios.get(`${baseUrl}/api/models/loaded`, { httpsAgent });
   if (data['0'] && data['0'].length) return data['0'][0] as string;
}

export async function getModels(baseUrl: string) {
   const { data }: any = await axios.get(`${baseUrl}/api/models/avaliable`, { httpsAgent });
   return data.filter(({backend}: {backend: string}) => backend === 'TensorRT').map(({ name }: { name: string }) => name);
}

export async function loadModel(model: string, baseUrl: string) {
   const start = Date.now();
   let currentModel = await getLoadedModel(baseUrl);
   if (currentModel && currentModel !== model) {
      await unloadModels(baseUrl);
      currentModel = undefined;
   }
   if (!currentModel) {
      await axios.post(`${baseUrl}/api/models/load?model=${model}&backend=TensorRT`, undefined, { httpsAgent });
      console.log(`🔃 Model Load Time: ${((Date.now() - start) / 1000).toFixed(1)}s`);
   }
   
}

function unloadModels(baseUrl: string) {
   return axios.post(`${baseUrl}/api/models/unload-all`, undefined, { httpsAgent });
}