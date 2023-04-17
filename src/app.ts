import yargs from 'yargs';
import { writeFile } from 'fs/promises';
import path from 'path';

import { getWildCards, allPossiblePrompts } from './wildcards';
import { readYamlFile } from './file';
import { getRandomInt } from "./random";
import { Txt2TxtConfig, runPrompts, configureParameters } from './text2text';


const argv = yargs(process.argv.slice(2)).options({
 inputPath: { type: 'string', require: true },
 baseUrl: { type: 'string', default: 'ws://192.168.0.29:7860/queue/join' },
 fixedSeed: { type: 'boolean', default: false },
}).parseSync();


async function run() {
  const input: Txt2TxtConfig = await readYamlFile(argv.inputPath);
  const wildcards = await getWildCards();

  console.log('Sending parameters...')
  await configureParameters(input.params, argv.baseUrl);

  input.params.seed = getRandomInt();
  const allPrompts: string[] = Array.from(new Set(input.prompts.flatMap((prompt) => allPossiblePrompts(prompt, wildcards))).values());
  console.log(`⚙️ ${allPrompts.length} total possible prompts to generate...`);

  if (input.models) {
    for (const model of input.models) {
      const output = await runPrompts(allPrompts, input.params, argv.fixedSeed, argv.baseUrl, input.softPrompt, model);
      await writeFile(`./output/${path.basename(argv.inputPath, '.yaml')}-${model}-${Date.now()}.txt`, output.join('\n\n\n'));
    }
  } else {
    const output = await runPrompts(allPrompts, input.params, argv.fixedSeed, argv.baseUrl, input.softPrompt);
    await writeFile(`./output/${path.basename(argv.inputPath, '.yaml')}-${Date.now()}.txt`, output.join('\n\n\n'));
  }
  console.log(`✅ ${allPrompts.length} prompt outputs generated successfully!!!`);
}

const start = Date.now();
run()
  .then(() => {
  console.log(`✅ Operation ran successfully`);
  console.log(`⏳ Total Duration: ${((Date.now() - start) / 1000).toFixed(0)}s`);
})
  .catch((e) => {
    console.error(`❌ Error running operation`);
    console.error(e);
    console.log(`⏳ Total Duration: ${((Date.now() - start) / 1000).toFixed(0)}s`);
});
