import { CHARACTER_SKILL_ICONS } from './character-skill-icons.js';
import { elementOf, EFFECTS } from './express-clicker.js?v=20261126-portal-play-1';
import { findCharacterScene, playCharacterScene } from './express-character-cinematics.js?v=20261124-expedition-3';

const ELEMENT_ACTORS={pyro:'flame',cryo:'ice',hydro:'bubble',electro:'lightning',dendro:'leaf',anemo:'feather',geo:'crystal',quantum:'mirror',imaginary:'star',spectro:'wave',havoc:'slash',physical:'blade'};
const attackSequences=new WeakMap();
const attackAngles=[0,150,70,225,310,110,270,35];

export function characterAnimation(person,key,world='gi') {
 const name=person?._name||person?.name||person?.en||key||'Voyageur';
 const id=String(person?.id||person?._id||'');
 const scene=findCharacterScene(person,key,world),element=elementOf(person);
 const skill=world==='gi'?(CHARACTER_SKILL_ICONS[id]?.[1]||CHARACTER_SKILL_ICONS[id.match(/100\d{5}/)?.[0]]?.[1]||''):'';
 return {key:String(key||name),name,scene,sceneId:scene?.id,authored:!!scene,title:scene?.title||name,color:person?.effectColor||EFFECTS[element][1],motif:scene?.actions[0].actor||ELEMENT_ACTORS[element],motion:scene?.actions[0].motion||'open',duration:scene?.duration||2000,skill,portrait:person?._quizImage||person?.icon||person?.images?.icon||person?.image||''};
}

export function playCharacterClick(stage,person,key,world='gi',options={}) {
 const descriptor=characterAnimation(person,key,world);
 // Compatibility for a newly imported character absent from the scene catalogue.
 // Registered characters always use their explicit authored composition.
 const scene=descriptor.scene||{id:`custom:${world}:${key}`,title:descriptor.name,actions:[{actor:'star',motion:'open',at:0},{actor:descriptor.motif,motion:'swoop',at:260},{actor:'star',motion:'impact',at:690}]};
 const boosted=options.amplified?{...scene,amplified:true,actions:scene.actions.map(a=>({...a})),duration:Math.min(2500,(scene.duration||2000)+180)}:scene;
 let direction=options.direction||0;if(options.normal&&stage){const n=attackSequences.get(stage)||0;attackSequences.set(stage,n+1);direction=attackAngles[n%attackAngles.length];}
 return playCharacterScene(stage,descriptor,boosted,{...options,direction});
}
