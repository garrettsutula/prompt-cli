export function allPossiblePrompts(prompt: string, wildcards: Map<string, string[]>): string[] {
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
}