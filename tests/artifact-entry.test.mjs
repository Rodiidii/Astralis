import test from 'node:test';
import assert from 'node:assert/strict';
import {validateManualArtifact} from '../src/artifact-entry.js';
const piece={setKey:'Test',slot:'goblet',level:20,mainType:'cryoDmg',mainValue:46.6,substats:[{type:'defFlat',value:39}]};
test('un palier douteux ou une fiche partielle ne bloque pas une saisie structurée',()=>{assert.equal(validateManualArtifact(piece).valid,true);assert.equal(validateManualArtifact({...piece,substats:[]}).valid,true);});
test('doublons, sous-stat principale et valeurs absentes sont refusés',()=>{for(const substats of [[{type:'atkPct',value:4},{type:'atkPct',value:5}],[{type:'cryoDmg',value:4}],[{type:'atkFlat',value:''}],[{type:'atkFlat',value:0}],[{type:'atkFlat',value:Infinity}]])assert.equal(validateManualArtifact({...piece,substats}).valid,false);});
test('emplacements, niveau et principale invalides sont refusés',()=>{for(const changes of [{slot:'flower'},{level:21},{level:1.5},{mainValue:NaN},{mainValue:-3},{setKey:''}])assert.equal(validateManualArtifact({...piece,...changes}).valid,false);});
