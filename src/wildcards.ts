import { globAsync } from './glob';
import { getList } from './file';

export async function getWildCards(): Promise<Map<string, string[]>> {
 const wildcards = new Map();
 
 const wildcardPaths = await globAsync('./wildcards');
 Promise.all(wildcardPaths.map(async (wildcardPath) => {
  const wildcardList = await getList(wildcardPath);
  wildcards.set(wildcardPath, wildcardList);
 }));

 return wildcards;
}