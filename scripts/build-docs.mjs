import {readFile,writeFile} from 'node:fs/promises';
import {documents,outputPath,renderDocument} from '../src/render-docs.mjs';
const root=new URL('../',import.meta.url);
for(const doc of documents){const md=await readFile(new URL(doc.path,root),'utf8');await writeFile(new URL(outputPath(doc.path),root),renderDocument(doc.path,md),'utf8')}
console.log('Generated '+documents.length+' documentation pages');
