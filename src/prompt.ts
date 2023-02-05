export function getRandomListItem<Type>(list: Type[]): Type {
 return list[Math.floor(Math.random()*list.length)];
}

function replaceWildcardkey(prompt: string, wildcardKey: string, wildcardValues: string[]): string {
 while (prompt.search(wildcardKey) !== -1) {
  prompt = prompt.replace(wildcardKey, getRandomListItem(wildcardValues));
 }
 return prompt;
}

export function replacePromptPlaceholders(prompt: string, wildcards: Map<string, string[]>): string {
 const placeHoldersInPrompt = Array.from(new Set(Array.from(prompt.matchAll(/__[a-zA-Z0-9\/]*__/g)).map(([token]) => token)).values());
 const replacedPrompt = placeHoldersInPrompt.reduce((acc, wildcardKey) => {
  if (!wildcards.has(wildcardKey)) throw new Error(`Wildcard key not found in wildcards: ${wildcardKey}`)
  return replaceWildcardkey(acc, wildcardKey, wildcards.get(wildcardKey) as string[]);
 }, prompt);
 if(replacedPrompt.search('__') !== -1) return replacePromptPlaceholders(replacedPrompt, wildcards);
 return replacedPrompt;
}