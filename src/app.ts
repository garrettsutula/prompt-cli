import yargs from 'yargs';
import { parse } from 'yaml';

import { getWildCards } from './wildcards';
import { getRandomListItem, replacePromptPlaceholders } from './prompt';
import { generateImage } from './text2img';
import { readYamlFile } from './file';

const argv = yargs(process.argv.slice(2)).options({
 input: { type: 'string', demandOption: true },
 runs: { type: 'number', default: 10 }
}).parseSync();


async function run() {
 const wildcards = await getWildCards();
 let currentIteration = 1;
 const yamlResult = await readYamlFile(`./input/${argv.input}.yaml`);
 const {
  prompts = [],
  negative: negative_prompt = '',
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
  await generateImage({
   prompt: replacePromptPlaceholders(getRandomListItem(prompts), wildcards),
   negative_prompt: replacePromptPlaceholders(negative_prompt, wildcards),
   width,
   height,
   steps,
   guidance_scale,
   batch_count,
   batch_size
  }, model);
  currentIteration += 1;
 }
}

run();