import axios from 'axios';

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

export async function generateImage(payload: Txt2ImgPayload, model: string, baseUrl: string) {
   // check for and load model if necessary
   await loadModel(model, baseUrl);
   payload.id = payload.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + Date.now().toString();
   return axios.post(`${baseUrl}/api/txt2img/generate`, {
      data: payload,
      model,
      scheduler: 7,
      backend: 'TensorRT',
      save_image: true,
    });
}

export async function getLoadedModel(baseUrl: string) {
   const response: any = await axios.get(`${baseUrl}/api/models/loaded`);
   if (response['0'] && response['0'].length) return response['0'][0] as string;
}

export async function loadModel(model: string, baseUrl: string) {
   let currentModel = await getLoadedModel(baseUrl);
   if (currentModel && currentModel !== model) {
      await unloadModels(baseUrl);
      currentModel = undefined;
   }
   if (!currentModel) {
      return axios.post(`${baseUrl}/api/models/load?model=${model}&backend=TensorRT`);
   }
}

function unloadModels(baseUrl: string) {
 return axios.post(`${baseUrl}/api/models/unload-all`);
}