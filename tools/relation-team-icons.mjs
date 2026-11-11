import { readFileSync } from 'node:fs';
import { imageSet } from '../src/data.js';

const roster = JSON.parse(readFileSync(new URL('../assets/data/gi-characters.json', import.meta.url)));
process.stdout.write(JSON.stringify(roster.map(character => [
  String(character.id),
  imageSet('gi', {...character, _id:String(character.id), _name:character.name}, 'character')
    .filter(url => url.startsWith('https://cdn.prydwen.gg/') && url.endsWith('_icon.webp'))
])));
