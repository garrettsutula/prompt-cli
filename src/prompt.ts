export function getRandomListItem<Type>(list: Type[]): Type {
 return list[Math.floor(Math.random()*list.length)];
}

function replaceWildcardkey(prompt: string, wildcardKey: string, wildcardValues: string[]): string {
 const wildcardToken = `__${wildcardKey}__`;
 while (prompt.search(wildcardToken) !== -1) {
  prompt = prompt.replace(wildcardToken, getRandomListItem(wildcardValues));
 }
 return prompt;
}

export function replacePromptPlaceholders(prompt: string, wildcards: Map<string, string[]>): string {
 return Array.from(wildcards.entries()).reduce((acc, [wildcardKey, wildcardValues]) => {
  return replaceWildcardkey(acc, wildcardKey, wildcardValues);
 }, prompt);
}