import fs from 'node:fs';

const source=JSON.parse(fs.readFileSync('data/lab-radiance-kits.json','utf8'));
const characters=Object.fromEntries(['Danica','Anastasya'].map(key=>[key,source.characters[key]]));
const output=`// Generated from the pinned French kit source in data/lab-radiance-kits.json.\nexport const RADIANCE_KITS=${JSON.stringify(characters)};\n`;
fs.writeFileSync('src/lab-radiance-kit-data.js',output);
console.log(JSON.stringify({characters:Object.keys(characters),bytes:output.length}));
