import yargs from 'yargs';

import { getWildCards } from './wildcards';
import { comboImages } from './scripts/comboPrompt';
import { loadModel } from './text2img';
import { readYamlFile } from './file';
import { modelTest } from './scripts/modelTest';
import { generateImages } from './scripts/generate';

const argv = yargs(process.argv.slice(2)).options({
 input: { type: 'string' },
 model: { type: 'string' },
 runs: { type: 'number', default: 10 },
 baseUrl: {type: 'string', default: 'https://localhost:5003' },
 combo: { type: 'boolean', default: false },
 modelTest: {type: 'string'}
}).parseSync();


async function run() {
  const input = await readYamlFile(`./input/${argv.input}.yaml`);
  const wildcards = await getWildCards();
  if (argv.model) {
    console.log(`⚙️ Loading model "${argv.model}...`);
    return loadModel(input, argv.baseUrl);
  } else if (argv.combo) {
    console.log(`⚙️ Generating all possible combinations`);
    return comboImages(input, wildcards, argv.baseUrl);
  } else if (argv.modelTest) {
    console.log(`⚙️ Running model test of ${argv.input} + ${argv.modelTest}`);
    const models = await readYamlFile(`./input/models/${argv.modelTest}.yaml`);
    return modelTest(input, wildcards, models, argv.baseUrl);
  } else if (argv.input) {
    console.log(`⚙️ Generating batch of ${argv.runs} images for ${argv.input}.yaml...`)
    return generateImages(input, wildcards, argv.baseUrl, argv.runs);
  } else {
    throw new Error(`Args not recognized: ${Object.keys(argv).join(', ')}`);
  }
}

run()
  .then(() => {
  console.log(`✅ Operation ran successfully`);
})
  .catch((e) => {
    console.error(`❌ Error running operation`)
    console.error(e);
});
