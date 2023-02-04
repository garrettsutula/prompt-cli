import {glob} from 'glob';

export async function globAsync(pattern: string): Promise<string[]> {
 return new Promise((resolve, reject) => {
  glob(pattern, (err: Error | null, matches: string[]) => {
   if (err) throw new Error(`glob error: ${JSON.stringify(err)}`);
   resolve(matches);
  })
 })
}