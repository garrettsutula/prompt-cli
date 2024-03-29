import { getModels, Txt2ImgInput } from "../text2img";
import { replacePromptPlaceholders, getRandomListItem } from "../prompt";
import { getRandomInt } from "../random";
import { generateImage } from "../text2img";
import { randomUUID } from 'crypto';

export async function modelTest(input: Txt2ImgInput, wildcards: Map<string, string[]>, models: string[], baseUrl: string) {
  let durations = [];
  let currentIteration = 1;

  input.prompt = replacePromptPlaceholders(getRandomListItem(input.prompts), wildcards),
  input.negative = replacePromptPlaceholders(input.negative, wildcards);
  input.seed = getRandomInt();
  input.id = randomUUID();

  const availableModels = await getModels(baseUrl);

  if (!models.every((model) => availableModels.includes(model))) {
    const notAvailable = models.filter((model) => !availableModels.includes(model));
    throw new Error(`❌ Can't continue, models not available:\n\n${notAvailable.join('\n')}`);
  }

   for (const currentModel of models) {
    input.model = currentModel;
    const { data } = await generateImage(input, baseUrl);
     currentIteration += 1;
     durations.push(data.time);
     console.log(`✅ ${currentIteration - 1} / ${models.length} - ${(data.time * 1000).toFixed(0)}ms duration (${(durations.reduce((a,b) => a + b, 0) * 1000 / durations.length).toFixed(0)}ms average)`);
   }
}