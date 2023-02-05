import yargs from 'yargs';
import { parse } from 'yaml';

import { getWildCards } from './wildcards';
import { getRandomListItem, replacePromptPlaceholders } from './prompt';
import { generateImage, loadModel } from './text2img';
import { readYamlFile } from './file';

const argv = yargs(process.argv.slice(2)).options({
 input: { type: 'string' },
 model: { type: 'string' },
 runs: { type: 'number', default: 10 },
 baseUrl: {type: 'string', default: 'https://localhost:5003' }
}).parseSync();


async function generateImages() {
  let durations = [];
  const wildcards = await getWildCards();
  let currentIteration = 1;
  const yamlResult = await readYamlFile(`./input/${argv.input}.yaml`);
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
  } = yamlResult;
  while (currentIteration - 1 < argv.runs) {
   const { data } = await generateImage({
    prompt: replacePromptPlaceholders(getRandomListItem(prompts), wildcards),
    negative_prompt: replacePromptPlaceholders(negative_prompt, wildcards),
    width,
    height,
    steps,
    guidance_scale,
    batch_count,
    batch_size
   }, model, argv.baseUrl);
   currentIteration += 1;
   durations.push(data.time);
   console.log(`✅ ${currentIteration - 1} / ${argv.runs} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
  }
}


function run() {
  if (argv.model) {
    return loadModel(argv.model, argv.baseUrl);
  } else if (argv.input) {
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