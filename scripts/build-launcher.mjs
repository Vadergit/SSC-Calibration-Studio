import {writeFile} from 'node:fs/promises';
import {renderLauncher} from '../src/render-launcher.mjs';
await writeFile(new URL('../index.html',import.meta.url),renderLauncher(),'utf8');
console.log('Static launcher generated');
