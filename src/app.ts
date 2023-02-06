import yargs, { boolean } from 'yargs';
import { parse } from 'yaml';

import { getWildCards } from './wildcards';
import { getRandomListItem, replacePromptPlaceholders } from './prompt';
import { allPossiblePrompts } from './comboPrompt';
import { generateImage, loadModel } from './text2img';
import { readYamlFile } from './file';
import { getRandomInt } from './random';


const argv = yargs(process.argv.slice(2)).options({
 input: { type: 'string' },
 model: { type: 'string' },
 runs: { type: 'number', default: 10 },
 baseUrl: {type: 'string', default: 'https://localhost:5003' },
 combo: { type: 'boolean', default: false },
 modelTest: {type: 'string'}
}).parseSync();


async function generateImages() {
  let durations = [];
  const seed = getRandomInt();
  let currentIteration = 1;

  const wildcards = await getWildCards();
  const input = await readYamlFile(`./input/${argv.input}.yaml`);

  const {
   prompts = [],
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
  while (currentIteration - 1 < argv.runs) {
   const { data } = await generateImage({
    prompt: replacePromptPlaceholders(getRandomListItem(prompts), wildcards),
    negative_prompt: replacePromptPlaceholders(negative_prompt, wildcards),
    width,
    height,
    steps,
    guidance_scale,
    batch_count,
    batch_size,
   }, model, sampler, argv.baseUrl);
   currentIteration += 1;
   durations.push(data.time);
   console.log(`✅ ${currentIteration - 1} / ${argv.runs} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
  }
}

async function comboImages() {
  let durations = [];
  const seed = getRandomInt();
  let currentIteration = 1;

  const wildcards = await getWildCards();
  const input = await readYamlFile(`./input/${argv.input}.yaml`);

  const {
   prompts = [],
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

  const allPositive = prompts.flatMap((prompt: string) => allPossiblePrompts(prompt, wildcards));
  const allNegative = allPossiblePrompts(negative_prompt, wildcards);

  const allImagePaylods = allPositive.flatMap((positivePrompt: string) => allNegative.map((negativePrompt: string) => {
    return {
      prompt: positivePrompt,
      negative_prompt: negativePrompt,
      width,
      height,
      steps,
      guidance_scale,
      batch_count,
      batch_size,
      seed,
    }
  }))
  console.log(`⚙️ ${allImagePaylods.length} total possible prompts to generate...`);
  for (const payload of allImagePaylods) {
   const { data } = await generateImage(payload, model, sampler, argv.baseUrl);
   currentIteration += 1;
   durations.push(data.time);
   console.log(`✅ ${currentIteration - 1} / ${allImagePaylods.length} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
  }
}

async function modelTest() {
  let durations = [];
  const seed = getRandomInt();
  let currentIteration = 1;

  const wildcards = await getWildCards();
  const models = await readYamlFile(`./input/models/${argv.modelTest}.yaml`);
  const input = await readYamlFile(`./input/${argv.input}.yaml`);

  const {
    prompts = [],
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

  const payload = {
    prompt: replacePromptPlaceholders(getRandomListItem(prompts), wildcards),
    negative_prompt: replacePromptPlaceholders(negative_prompt, wildcards),
    width,
    height,
    steps,
    guidance_scale,
    batch_count,
    batch_size,
    seed,
   }

   for (const currentModel of models) {
    const { data } = await generateImage(payload, currentModel, sampler, argv.baseUrl);
     currentIteration += 1;
     durations.push(data.time);
     console.log(`✅ ${currentIteration - 1} / ${argv.runs} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
   }
}

function run() {
  if (argv.model) {
    console.log(`⚙️ Loading model "${argv.model}...`);
    return loadModel(argv.model, argv.baseUrl);
  } else if (argv.combo) {
    console.log(`⚙️ Generating all possible combinations`);
    return comboImages();
  } else if (argv.modelTest) {
    console.log(`⚙️ Running model test of ${argv.input} + ${argv.modelTest}`);
    return modelTest();
  } else if (argv.input) {
    console.log(`⚙️ Generating batch of ${argv.runs} images for ${argv.input}.yaml...`)
    return generateImages();
  } else {
    throw new Error(`Args not recognized: ${Object.keys(argv).join(', ')}`);
  }
}

run()
  .then((result) => {
  console.log(`✅ Operation ${argv.input ? 'txt2img' : 'loadModel'} ran successfully`);
})
  .catch((e) => {
    console.error(JSON.stringify(e));
    throw new Error(`Error running ${argv.input ? 'txt2img' : 'loadModel'}`);
  })