import yargs from 'yargs';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';


import { getWildCards } from './wildcards';
import { readYamlFile } from './file';
import { getRandomInt } from "./random";
import { text2text } from './text2text';

const argv = yargs(process.argv.slice(2)).options({
 inputPath: { type: 'string' },
 baseUrl: {type: 'string', default: 'https://localhost:5003' },
}).parseSync();

function allPossiblePrompts(prompt: string, wildcards: Map<string, string[]>): string[] {
  const matchResults = prompt.match(/__[a-zA-Z0-9\/]*__/);
  if (matchResults) {
   const [ nextWildcardKey ] = matchResults;
   if (!wildcards.has(nextWildcardKey)) throw new Error(`Wildcard key not found in wildcards: ${nextWildcardKey}`);
   const wildcardValues = wildcards.get(nextWildcardKey) as string[];
   return wildcardValues.flatMap((wildcardValue) => {
    const newPrompt = prompt.replace(nextWildcardKey, wildcardValue);
    if (newPrompt.search(/__[a-zA-Z0-9\/]*__/) !== -1) return allPossiblePrompts(newPrompt, wildcards);
    else return newPrompt;
   })
  }
  return [ prompt ];
 };

async function run() {
  const input = await readYamlFile(`./input/${argv.inputPath}.yaml`);
  const wildcards = await getWildCards();
  let output = [];
  let currentIteration = 1;

  input.id = randomUUID();
  input.seed = getRandomInt();
  const allPromptsWithDupes: string[] = input.prompts.flatMap((prompt: string): string[] => allPossiblePrompts(prompt, wildcards));
  const allPrompts: string[] = Array.from(new Set(allPromptsWithDupes).values());
  console.log(`⚙️ ${allPrompts.length} total possible prompts to generate...`);

  for (const prompt of allPrompts) {
    console.log(`⚙️ (${currentIteration}/${allPrompts.length}) - Starting: "${prompt}"`)
    const result = await text2text(prompt, argv.baseUrl);
    currentIteration += 1;
    output.push(result);
  }

  await writeFile('./output.txt', output.join('\n\n\n'));
  console.log(`✅ ${allPrompts.length} prompt outputs generated successfully!!!`);

}

const start = Date.now();
run()
  .then(() => {
  console.log(`✅ Operation ran successfully`);
  console.log(`⏳ Total Duration: ${((Date.now() - start) / 1000).toFixed(0)}s`);
})
  .catch((e) => {
    console.error(`❌ Error running operation`)
    console.error(e);
    console.log(`⏳ Total Duration: ${((Date.now() - start) / 1000).toFixed(0)}s`);
});
