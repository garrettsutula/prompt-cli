import { readFile, writeFile } from 'fs/promises';
import { Txt2ImgPayload } from './text2img';
import {parse} from 'yaml';

export async function writeImageToDisk(model: string, payload: Txt2ImgPayload, imgData: string) {
 return writeFile(`./output/${model}/${payload.prompt}.${payload.seed}.png`, imgData, 'base64');
}

export async function getList(path: string): Promise<string[]> {
 return await (await readFile(path)).toString().split('\n');
}

export async function readYamlFile(path: string) {
 const fileContents = await (await readFile(path)).toString();
 return parse(fileContents)
}