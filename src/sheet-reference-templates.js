import {template as team} from './sheets/team.js';
import {template as compare} from './sheets/compare.js';
import {template as lab} from './sheets/lab.js';
import {template as build} from './sheets/build.js';
import {template as farm} from './sheets/farm.js';
export {shares,statRows} from './sheets/common.js';
export function referenceMarkup(type,data,element){return {team,compare,lab,build,farm}[type](data,element);}
