export function getRandomListItem<Type>(list: Type[]): Type {
 return list[Math.floor(Math.random()*list.length)];
}

function replaceWildcardkey(prompt: string, wildcardKey: string, wildcardValues: string[]): string {
 while (prompt.search(wildcardKey) !== -1) {
  prompt = prompt.replace(wildcardKey, getRandomListItem(wildcardValues));
 }
 return prompt;
}

export function replacePromptPlaceholders(prompt: string, wildcards: Map<string, string[]>, seen = new Set()): string {
 const placeHoldersInPrompt = Array.from(new Set(Array.from(prompt.matchAll(/__[a-zA-Z0-9\/]*__/g)).map(([token]) => token)).values());
 const replacedPrompt = placeHoldersInPrompt.reduce((acc, wildcardKey) => {
  if (!wildcards.has(wildcardKey)) throw new Error(`Wildcard key not found in wildcards: ${wildcardKey}`);
  if (seen.has(wildcardKey)) throw new Error(`Wildcard key "${wildcardKey} has been seen already, breaking infinite loop?`);
  seen.add(wildcardKey);
  return replaceWildcardkey(acc, wildcardKey, wildcards.get(wildcardKey) as string[]);
 }, prompt);
 if(replacedPrompt.search(/__[a-zA-Z0-9\/]*__/) !== -1) return replacePromptPlaceholders(replacedPrompt, wildcards, seen);
 return replacedPrompt;
}