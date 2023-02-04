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

export async function generateImage(payload: Txt2ImgPayload, model: string) {
   // check for and load model if necessary

   payload.id = payload.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
   return axios.post('http://localhost:5003/api/txt2img/generate', {
      data: payload,
      model,
      scheduler: 7,
      backend: 'TensorRT',
      save_image: true,
    });
}

export async function getLoadedModel() {
   const response = axios.get('http://localhost:5003/api/models/loaded');
   return response;
}

export function loadModel(model: string) {
   return axios.post(`http://localhost:5003/api/models/load?model=${model}&backend=TensorRT`);
}

function unloadModels() {
 return axios.post('http://localhost:5003/api/models/unload-all');
}