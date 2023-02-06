import { getRandomInt } from "../random";
import { Txt2ImgInput } from "../text2img";
import { replacePromptPlaceholders } from "../prompt";
import { generateImage } from "../text2img";

export async function comboImages(input: Txt2ImgInput, wildcards: Map<string, string[]>, baseUrl: string) {
  let durations = [];
  const seed = getRandomInt();
  let currentIteration = 1;

  input.negative = replacePromptPlaceholders(input.negative, wildcards);

  const allPositive = input.prompts.flatMap((prompt: string) => allPossiblePrompts(prompt, wildcards));
  console.log(`⚙️ ${allPositive.length} total possible prompts to generate...`);

  for (const prompt of allPositive) {
    input.prompt = prompt;
    const { data } = await generateImage(input, baseUrl);
    currentIteration += 1;
    durations.push(data.time);
    console.log(`✅ ${currentIteration - 1} / ${allPositive.length} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
  }
}

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
