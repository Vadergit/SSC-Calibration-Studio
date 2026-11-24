import {elmos} from './elmos.mjs';
import {validateModule} from '../../packages/core/index.mjs';
export const modules=Object.freeze({[elmos.id]:validateModule(elmos)});
