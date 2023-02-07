import { Txt2ImgInput } from "../text2img";
import { replacePromptPlaceholders, getRandomListItem } from "../prompt";
import { generateImage } from "../text2img";
import { randomUUID } from 'crypto';

export async function generateImages(input: Txt2ImgInput, wildcards: Map<string, string[]>, baseUrl: string, runs: number) {
  let durations = [];
  let currentIteration = 1;

  input.negative = replacePromptPlaceholders(input.negative, wildcards);
  input.id = randomUUID();

  while (currentIteration - 1 < runs) {
    input.prompt = replacePromptPlaceholders(getRandomListItem(input.prompts), wildcards);
    const { data } = await generateImage(input, baseUrl);
    currentIteration += 1;
    durations.push(data.time);
    console.log(`✅ ${currentIteration - 1} / ${runs} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
  }
}