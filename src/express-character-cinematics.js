import { CHARACTER_SHAPES } from './express-character-shapes.js?v=20261124-expedition-3';
import { CHARACTER_SCENES } from './express-character-scenes.js?v=20261124-expedition-3';
import { CHARACTER_SCENE_NAMES } from './express-character-scene-names.js?v=20261124-expedition-3';

const canonical=s=>String(s||'').replace(/<[^>]*>/g,'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function findCharacterScene(person,key,world){
 const direct=CHARACTER_SCENES[`${world}:${String(person?.id||person?._id||'')}`];if(direct)return direct;
 const id=String(person?.id||person?._id||'').match(/\d+/)?.[0],name=canonical(person?._name||person?.name||person?.en||key);
 return CHARACTER_SCENES[`${world}:${id}`]||CHARACTER_SCENES[CHARACTER_SCENE_NAMES[`${world}:${name}`]]||CHARACTER_SCENES[CHARACTER_SCENE_NAMES[`${world}:${canonical(key)}`]]||null;
}

// Large actors rather than a spray of interchangeable particles. Geometry is
// code-native, and the actual character skill icon accompanies the sequence.
const DRAW={
 ember:'<path d="M10 5L21 13 13 24 3 17ZM43 2L58 9 49 21 37 15ZM25 30L39 35 32 49 19 43ZM48 40L60 47 51 62 40 54Z"/>',
 club:'<path d="M21 3H43L49 11 43 40H36V62H28V40H21L15 11ZM16 13H48M17 23H47M21 34H43M25 8V34M39 8V34"/>',
 lightblade:'<path d="M32 0L47 19 39 42H37V53H27V42H25L17 19ZM32 9V40M12 40H52V46H12M27 53H37V63H27M21 20L32 27 43 20"/>',
 thunderlord:'<path d="M21 14L14 2 28 7H38L51 2 44 14 45 25 37 31H27L19 25ZM15 31L29 27 36 27 50 32 58 50 46 55 39 39V63H25V40L18 55 6 50ZM29 14H37M29 23H37M5 0V63M1 7L5 0 10 7Z"/>',
 rifle:'<path d="M1 13H46V20H64V25H45L39 33H24L17 49H6L15 30H1ZM20 18H42M24 33L33 49H44L37 32M48 15V27"/>',
 greatsword:'<path d="M26 0H38L47 9 43 40H39V49H25V40H21L17 9ZM27 49H37V62H27ZM12 40H52V46H12ZM32 4V36M26 15L32 22 38 15"/>',
 fracture:'<path d="M32 31L21 20 25 8 12 0M32 31L46 21 48 6 63 1M32 31L49 34 61 26M32 31L35 48 53 63M32 31L20 42 23 58 13 63M32 31L11 33 2 48M30 23L39 17M44 39L55 47"/>',
 darksun:'<circle cx="32" cy="32" r="20"/><path d="M26 1L29 13M45 3L40 15M60 16L49 24M64 36L51 35M56 54L46 45M37 64L35 51M17 60L24 48M3 46L15 40M0 26L13 28M10 9L20 18M24 22L41 42M41 22L24 42"/>',
 shards:'<path d="M1 5L19 12 5 29ZM38 2L62 8 49 20ZM23 25L38 34 20 42ZM2 49L17 41 15 62ZM44 43L60 31 63 59Z"/>',
 potioncloud:'<path d="M8 40C-6 26 7 12 20 18 16-5 47-4 46 17 65 9 76 37 58 43 64 61 37 68 32 53 17 69-1 54 8 40ZM32 16L22 37H33L27 51 45 28H33Z"/>',
 core:'<circle cx="32" cy="32" r="22"/><path d="M32 3L54 19V45L32 61 10 45V19ZM32 18L43 32 32 46 21 32ZM0 32H10M54 32H64"/>',
 beacon:'<path d="M22 61L25 24H39L42 61ZM15 61H49M32 24V12M15 20Q32 1 49 20M7 12Q32-11 57 12"/>',
 mortar:'<path d="M5 52L24 14 44 24 25 62ZM24 14L29 3 49 13 44 24M25 62L55 61 39 35M7 52L1 61H28"/>',
 shell:'<path d="M22 62V19L32 1 42 19V62ZM22 48H42M25 12H39M26 28H38"/>',
 frostseal:'<path d="M32 0L43 21 64 32 43 43 32 64 21 43 0 32 21 21ZM32 12V52M12 32H52M20 20L44 44M20 44L44 20"/>',
 arrow:'<path d="M4 60L53 11M38 11H53V26M4 47L17 49 19 62M53 11L62 2"/>',
 ice:'<path d="M32 1V63M5 16L59 48M5 48L59 16M20 7L32 16 44 7M20 57L32 48 44 57M5 29L17 23 16 9M48 55L47 41 59 35"/>',
 lightning:'<path d="M38 1L8 37H28L22 63 58 24H37Z"/>',
 boomerang:'<path d="M2 55L15 7 58 0 61 11 26 19 11 59ZM15 7L26 19M7 38L19 40"/>',
 portal:'<ellipse cx="32" cy="32" rx="23" ry="30"/><ellipse cx="32" cy="32" rx="14" ry="23"/><path d="M8 13L56 51M8 51L56 13"/>',
 rabbit:'<path d="M22 33C9 2 16-8 25 26L30 31C32-3 46-5 38 32C59 35 59 61 33 62 8 63 5 39 22 33Z"/><circle cx="25" cy="43" r="2"/><circle cx="40" cy="43" r="2"/><path d="M29 51L33 54 37 51M17 58L10 64M48 58L55 64"/>',
 bomb:'<circle cx="32" cy="38" r="22"/><path d="M26 16V10H38V16M32 10Q31 0 43 3M45 1L50 6M48 0L45 8M24 30Q16 33 17 43"/>',
 ghost:'<path d="M9 60V27C9-3 55-3 55 27V60L45 52 36 60 27 52 18 60Z"/><ellipse cx="24" cy="25" rx="3" ry="5"/><ellipse cx="42" cy="25" rx="3" ry="5"/><path d="M26 41Q33 48 41 39"/>',
 column:'<path d="M19 62V12L32 2 45 12V62ZM19 12H45M24 18H40V54H24ZM32 2V62M10 62H54"/>',
 meteor:'<path d="M18 22L32 13 49 20 55 38 39 54 20 49 10 34ZM18 22L34 34 49 20M34 34L39 54M7 14L24 24M17 3L31 18M35 0L41 16"/>',
 eye:'<path d="M2 32Q31 0 62 32 31 64 2 32Z"/><circle cx="32" cy="32" r="13"/><path d="M32 18L25 35H34L30 48 42 28H33Z"/>',
 lotus:'<path d="M32 55C6 42 12 17 19 14L32 31 45 14C55 24 55 44 32 55ZM32 55C18 30 25 10 32 2 40 13 44 32 32 55ZM30 55C4 59 0 39 2 31L23 36M34 55C60 59 64 39 62 31L41 36"/>',
 leaf:'<path d="M10 55C-1 16 19 0 59 4 66 42 48 64 10 55ZM10 55L50 13M23 42L21 23M35 29L53 33"/>',
 wave:'<path d="M1 39C12 5 46-8 53 17 27 7 24 50 63 41M1 52Q31 67 63 52M15 42Q23 29 37 32"/>',
 bubble:'<circle cx="32" cy="32" r="27"/><path d="M13 27Q15 13 29 11M47 48L51 44"/>',
 fish:'<path d="M12 32C32-4 51 11 57 32 48 55 26 64 12 32ZM12 32L0 17V48ZM30 18L39 4 47 17"/><circle cx="46" cy="28" r="2"/>',
 dice:'<rect x="9" y="9" width="46" height="46" rx="8"/><circle cx="21" cy="21" r="3"/><circle cx="43" cy="21" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="21" cy="43" r="3"/><circle cx="43" cy="43" r="3"/>',
 card:'<rect x="12" y="3" width="40" height="58" rx="5"/><path d="M32 14L44 31 32 48 20 31ZM17 9H23M41 55H47"/>',
 mirror:'<path d="M32 2L58 18V49L32 62 6 49V18ZM13 21L32 10 51 21V45L32 54 13 45ZM21 38L42 22M24 46L46 29"/>',
 gate:'<path d="M5 62V9H59V62M15 62V18H49V62M1 9H63M10 18V62M54 18V62M1 57H63"/>',
 dragon:'<path d="M5 54Q51 56 38 34 10 20 24 8L37 13 49 6 47 19 60 23 49 30 42 24Q62 51 39 60M23 9L19 0M35 12L35 1M25 30L14 34M39 46L49 50"/><circle cx="43" cy="19" r="2"/>',
 butterfly:'<path d="M32 27C5-19-15 24 24 36 1 70 30 67 32 43 34 67 63 70 40 36 79 24 59-19 32 27ZM32 25V54M32 29L23 13M32 29L41 13"/>',
 crystal:'<path d="M32 1L56 20 48 54 32 63 16 54 8 20ZM32 1L24 23 32 63 40 23ZM8 20L24 23 40 23 56 20"/>',
 claw:'<path d="M4 59Q9 14 22 3L18 23 15 46ZM23 61Q28 17 38 1L36 22 34 48ZM42 57Q47 18 60 8L56 30 52 49Z"/>',
 paw:'<ellipse cx="32" cy="46" rx="19" ry="14"/><ellipse cx="11" cy="28" rx="7" ry="10"/><ellipse cx="26" cy="15" rx="7" ry="10"/><ellipse cx="42" cy="16" rx="7" ry="10"/><ellipse cx="56" cy="29" rx="7" ry="10"/>',
 spear:'<path d="M8 59L47 16M45 18L43 4 62 1 59 20ZM43 20L51 27M5 55L13 62"/>',
 gear:'<path d="M24 2H40L42 12 49 15 58 11 64 25 56 32 57 39 63 47 52 59 42 54 34 57 28 64 14 57 16 46 10 40 1 38 2 23 12 21 17 14Z"/><circle cx="32" cy="32" r="12"/>',
 flame:'<path d="M35 1C39 20 61 23 57 46 52 71 9 68 7 44 5 30 18 22 20 10 25 29 30 26 35 1ZM32 34C42 46 44 58 32 62 19 59 22 47 32 34Z"/>',
 star:'<path d="M32 1L40 23 63 32 40 41 32 63 24 41 1 32 24 23Z"/>',
 music:'<path d="M24 48V10L54 3V42M24 18L54 11"/><ellipse cx="15" cy="52" rx="10" ry="7"/><ellipse cx="45" cy="46" rx="10" ry="7"/>',
 wind:'<path d="M3 24H47C64 24 64 1 48 3Q39 5 43 13M3 35H57M8 46H38C55 46 56 64 42 63"/>',
 thread:'<path d="M1 12C31-10 1 67 32 47 65 24 7 9 31 15 65 28 32 65 63 52M1 32Q32 4 63 32"/>',
 book:'<path d="M3 8Q22 2 32 13 42 2 61 8V55Q43 49 32 61 20 50 3 55ZM32 13V61M9 17L24 21M9 27L24 31M40 21L54 16M40 31L54 26"/>',
 gun:'<path d="M4 10H59V25H40L30 53H14L23 27 4 25ZM42 15V21M9 15H34M30 30H39V38H27"/>',
 mask:'<path d="M9 4Q32 13 55 4V34Q52 53 32 63 12 53 9 34ZM15 25L27 29 22 36 15 33M49 25L37 29 42 36 49 33M23 47L32 43 41 47"/>',
 rose:'<path d="M32 46C-4 53-5 18 16 17 8-1 41-10 45 12 68 8 72 44 48 46 47 64 15 68 16 45ZM24 24Q43 12 47 30 48 44 31 44 17 44 20 33L35 26 40 34 31 38M32 47V64"/>',
 shield:'<path d="M32 2L57 12V36Q52 54 32 63 12 54 7 36V12ZM32 11L48 18V35Q43 47 32 53 20 47 16 35V18ZM32 17V47M21 31H43"/>',
 camera:'<path d="M4 17H17L21 8H43L47 17H60V56H4ZM11 24H18"/><circle cx="34" cy="36" r="13"/><circle cx="34" cy="36" r="7"/>',
 feather:'<path d="M8 57C-5 20 24 0 60 4 58 39 41 57 8 57ZM8 57L49 13M23 41L22 20M36 28L55 28"/>',
 sun:'<circle cx="32" cy="32" r="16"/><path d="M32 0V10M32 54V64M0 32H10M54 32H64M9 9L16 16M48 48L55 55M9 55L16 48M48 16L55 9"/>',
 moon:'<path d="M44 3C-3 0-11 59 32 63 46 64 58 56 63 43 33 57 13 24 44 3Z"/>',
 anchor:'<path d="M32 14V58M17 25H47M3 35Q3 60 32 61 61 60 61 35M3 35L0 48M3 35L16 41M61 35L64 48M61 35L48 41"/><circle cx="32" cy="8" r="6"/>',
 clock:'<circle cx="32" cy="32" r="28"/><path d="M32 11V32L48 42M31 4V8M4 32H9M55 32H60M32 55V60"/>',
 hammer:'<path d="M24 24L3 49 15 61 38 35M21 2L61 31 49 47 9 18Z"/>',
 flower:'<path d="M32 60C2 50 0 17 19 23 13-3 48-4 44 22 66 13 70 45 42 48Z"/><circle cx="32" cy="32" r="9"/>',
 bunny:'<path d="M20 31L12 2Q24-4 28 30M35 30L40 0Q54 0 44 33"/><ellipse cx="32" cy="46" rx="24" ry="17"/>',
 bull:'<path d="M8 19L0 3 20 12H44L64 3 56 21V47L43 61H21L8 47ZM18 29L27 34M46 29L37 34M22 48H42"/>',
 raven:'<path d="M1 15L25 25 32 9 43 22 63 11 52 36 39 39 32 62 25 39 12 36Z"/>',
 eyelet:'<circle cx="32" cy="32" r="24"/><path d="M8 32H56M32 8V56"/>',
 robot:'<rect x="8" y="15" width="48" height="43" rx="8"/><path d="M32 4V15M3 28H8M56 28H63M20 43H44"/><circle cx="21" cy="31" r="4"/><circle cx="43" cy="31" r="4"/>',
 hat:'<path d="M15 2H50L44 46H20ZM15 38H49V46H15ZM1 46Q32 36 63 46L60 59H4Z"/>',
 fan:'<path d="M32 61L2 26Q32-10 62 26ZM32 61L14 17M32 61V8M32 61L50 17"/>',
 crab:'<path d="M15 31Q32 18 49 31V45Q32 60 15 45ZM15 35L4 25 1 12 13 17 15 31M49 35L60 25 63 12 51 17 49 31M17 46L7 57M47 46L57 57M23 28V18M41 28V18"/>',
 octopus:'<path d="M15 35V18C15-4 49-4 49 18V35M16 35Q-2 58 5 63M25 35Q17 60 23 63M39 35Q47 60 41 63M48 35Q66 58 59 63"/><circle cx="25" cy="20" r="2"/><circle cx="39" cy="20" r="2"/>',
 seahorse:'<path d="M40 9Q26-6 16 9L10 18 22 22Q9 38 27 45 48 53 28 60 16 62 19 51M39 10L52 19 39 26V37L49 45 36 43M16 9L11 1M22 23L35 19"/>',
 jellyfish:'<path d="M3 31C3-6 61-6 61 31ZM12 32Q3 46 15 62M25 32Q37 48 24 63M40 32Q30 50 43 63M53 32Q62 46 54 61"/>',
 ghostwing:'<path d="M32 18C17-3 2 4 3 25L20 42 32 60 44 42 61 25C62 4 47-3 32 18Z"/>',
 frame:'<path d="M2 22V2H22M42 2H62V22M62 42V62H42M22 62H2V42M22 32H42M32 22V42"/>',
 wheel:'<circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="9"/><path d="M32 5V23M32 41V59M5 32H23M41 32H59M13 13L25 25M39 39L51 51M13 51L25 39M39 25L51 13"/>',
 scissors:'<circle cx="13" cy="50" r="10"/><circle cx="51" cy="50" r="10"/><path d="M20 43L55 1 32 33 9 1 44 43"/>',
 tree:'<path d="M32 0L4 29H20L3 46H24V63H40V46H61L44 29H60Z"/>',
 instrument:'<path d="M2 14Q32-1 62 14L52 57H12ZM11 16L20 55M23 10L27 56M41 10L37 56M53 16L44 55"/>',
 pot:'<path d="M9 17H55V45Q53 61 32 61 11 61 9 45ZM1 23H9M55 23H63M7 17Q32 2 57 17M29 5V1"/>',
 bottle:'<path d="M23 2H41V8L37 12V26Q65 56 46 62H18Q-1 56 27 26V12L23 8ZM15 44H49M24 34H40"/>',
 pixel:'<path d="M3 3H24V24H3ZM40 3H61V24H40ZM3 40H24V61H3ZM40 40H61V61H40ZM25 25H39V39H25Z"/>',
 compass:'<circle cx="32" cy="32" r="27"/><path d="M45 15L38 39 15 49 24 25ZM24 25L38 39"/>',
 cross:'<path d="M23 3H41V23H61V41H41V61H23V41H3V23H23Z"/>',
 heart:'<path d="M32 60C-15 26 3-13 32 11 61-13 79 26 32 60Z"/>',
 crown:'<path d="M5 11L21 31 32 3 43 31 59 11 54 54H10ZM10 45H54"/>',
 umbrella:'<path d="M2 31Q4-11 32 4 60-11 62 31Q53 24 46 31 38 24 32 31 24 24 18 31 10 24 2 31ZM32 4V55Q32 66 42 60"/>',
 wing:'<path d="M30 59C-8 44-7 0 2 1L30 23 32 4 35 23 62 1C72 27 58 49 35 60ZM2 13L24 31M7 28L25 40M15 43L28 49M62 13L40 31M57 28L39 40M49 43L36 49"/>',
 bell:'<path d="M8 49L15 39V20C15-2 49-2 49 20V39L56 49ZM3 51H61M24 56Q32 69 40 56"/>',
 pillow:'<path d="M5 3Q32 10 59 3 52 32 59 61 32 54 5 61 12 32 5 3ZM22 21L42 43M42 21L22 43"/>'
};
Object.assign(DRAW,CHARACTER_SHAPES);
export const SCENE_ACTORS = Object.freeze(Object.keys(DRAW));
export const SCENE_MOTIONS = Object.freeze(['dash','cross','draw','rain','rise','open','close','lob','hop','explode','swoop','spiral','orbit','weave','return','roll','stomp','beam','pour','wake','swing','summon','flash','ring','impact','zigzag','shatter','alchemy','cataclysm','rupture','collapse','meteorfall','aftershock','debris','guard','rewind','turnhour','germinate','spacelock','toast']);

const K=(x,y,scale=1,rotate=0,opacity=1)=>({x,y,scale,rotate,opacity});
function path(motion,index){
 const side=index===1?-1:1;
 switch(motion){
 case'guard':return [K(-75,0,.1,0,0),K(-75,0,.85,0),K(-75,-8,1.05,0),K(-75,-16,.9,0,0)];
 case'rewind':return [K(0,0,.2,0,0),K(0,0,1.2,-90),K(0,0,1.6,-180),K(0,0,1.2,-270),K(0,0,.2,-360,0)];
 case'turnhour':return [K(0,-65,.2,0,0),K(0,-65,1,0),K(0,-65,1,180),K(0,-65,1,180),K(0,-65,.2,180,0)];
 case'germinate':return [K(0,70,.05,0,0),K(0,40,.4,-8),K(0,-10,1.2,6),K(0,-35,1.5,-4),K(0,-45,1.5,0,0)];
 case'spacelock':return [K(0,0,2.1,45,0),K(0,0,1.7,20),K(0,0,1.2,0),K(0,0,1.2,0),K(0,0,.1,-25,0)];
 case'toast':return [K(-80,60,.3,-20,0),K(-55,-15,1,-15),K(-10,-30,1.25,25),K(20,-10,1.1,55),K(40,35,.3,65,0)];
 case'meteorfall':return [K(-105,-245,.35,30,0),K(-72,-165,.65,25),K(-28,-65,1,20),K(0,35,1.45,15),K(5,45,.8,5,0)];
 case'aftershock':return [K(0,45,.1,0,0),K(0,45,.8,0),K(0,45,1.8,0),K(0,45,2.3,0,0)];
 case'debris':return [K(0,35,.2,0,0),K(0,15,.8,10),K(5,5,1.5,30),K(10,55,2,50,0)];
 case'cataclysm':return [K(0,-220,1.3,-18,0),K(0,-135,2,-12),K(0,-115,2.1,-6),K(0,40,2.65,0),K(0,48,2.5,0),K(0,48,2.4,0,0)];
 case'rupture':return [K(0,55,.1,0,0),K(0,55,1.7,0),K(0,55,3.6,0),K(0,55,4.7,0,.5),K(0,55,5.2,0,0)];
 case'collapse':return [K(0,-25,.2,0,0),K(0,-25,1.9,10),K(0,-25,3.2,25),K(0,-25,.6,40),K(0,-25,.02,60,0)];
 case'shatter':return [K(0,40,.1,0,0),K(0,35,.6,12),K(0,10,1.7,25),K(0,70,2.7,40,0)];
 case'alchemy':return [K(0,50,.1,0,0),K(0,10,1.2,-10),K(-10,-15,2.1,10),K(10,-40,2.6,-5),K(0,-80,2.8,0,0)];
 case'dash':return [K(-240*side,30,.7,-20,0),K(-150*side,15,1,-10),K(0,0,1.2,0),K(200*side,-20,.8,15,0)];
 case'cross':return [K(-190*side,-120,.6,-50,0),K(-80*side,-50,1,-30),K(0,0,1.4,30),K(180*side,100,.7,70,0)];
 case'draw':return [K(-120,100,.2,-130,0),K(-60,30,1.2,-60),K(20,-30,1.6,10),K(90,-100,.7,70,0)];
 case'rain':return [K(-90*side,-240,.4,-20,0),K(-65*side,-160,.8,-10),K(0,-10,1.3,10),K(30*side,80,.6,30,0)];
 case'rise':return [K(-80*side,170,.3,0,0),K(-80*side,80,1,0),K(-80*side,-15,1.4,0),K(-80*side,-80,1.1,0,0)];
 case'open':return [K(0,0,.05,0,0),K(0,0,.8,0),K(0,0,1.9,0),K(0,0,2.4,0,0)];
 case'close':return [K(0,0,3,0,0),K(0,0,2.2,0),K(0,0,1,0),K(0,0,.3,0,0)];
 case'lob':return [K(-200*side,80,.6,-30,0),K(-110*side,-130,.9,0),K(0,35,1.2,35),K(20*side,50,.8,55,0)];
 case'hop':return [K(-100*side,60,.8,-10,0),K(-60*side,-40,1,-5),K(-20*side,65,.8,5),K(25*side,-35,1.1,15),K(65*side,60,.7,25,0)];
 case'explode':return [K(0,20,.1,0,0),K(0,15,.5,0),K(0,5,2.4,30),K(0,0,3.8,60,0)];
 case'swoop':return [K(-220*side,-140,.4,-25,0),K(-130*side,-70,1,-15),K(0,10,1.5,0),K(140*side,-100,.9,25),K(220*side,-160,.3,40,0)];
 case'spiral':return [K(-120,-40,.5,-70,0),K(-40,-130,1,-20),K(125,-20,1.2,50),K(20,100,1,120),K(-120,5,.4,190,0)];
 case'orbit':return [K(0,-120,.6,0,0),K(135,0,1,90),K(0,100,1.2,180),K(-135,0,1,270),K(0,-120,.5,360,0)];
 case'weave':return [K(-200,-20,.5,-25,0),K(-110,70,1,10),K(-20,-70,1.3,-20),K(100,65,1,15),K(200,-25,.5,30,0)];
 case'return':return [K(-160,30,.6,-10,0),K(0,-75,1,90),K(160,30,1.3,180),K(0,85,1,270),K(-160,30,.6,360,0)];
 case'roll':return [K(-180,65,.4,-120,0),K(-70,40,1,-60),K(25,25,1.3,60),K(145,65,.8,180),K(210,80,.5,270,0)];
 case'stomp':return [K(0,-210,.6,0,0),K(0,-120,1.2,0),K(0,30,1.8,0),K(0,35,1.4,0),K(0,35,1.1,0,0)];
 case'beam':return [K(-90*side,0,.1,-90,0),K(-60*side,0,.5,-90),K(0,0,2,-90),K(150*side,0,1.2,-90,0)];
 case'pour':return [K(40,-130,.5,-10,0),K(15,-60,1,-25),K(-20,0,1.5,-45),K(-80,100,.5,-70,0)];
 case'wake':return [K(-160,40,.2,0,0),K(-50,30,1,10),K(70,20,1.6,20),K(190,10,1.8,25,0)];
 case'swing':return [K(-100,-40,.5,-75,0),K(-50,-10,1,-40),K(50,-10,1.4,40),K(100,-40,.5,75,0)];
 case'summon':return [K(-100*side,80,.05,0,0),K(-100*side,40,.7,0),K(-100*side,20,1.4,0),K(-100*side,35,1.2,0,0)];
 case'flash':return [K(0,-20,.3,0,0),K(0,-20,1.5,0),K(0,-20,2,0,.2),K(0,-20,2.8,0,0)];
 case'ring':return [K(0,0,.3,0,0),K(0,0,1,60),K(0,0,2.2,120),K(0,0,3,180,0)];
 case'impact':return [K(0,20,.1,0,0),K(0,20,1.6,15),K(0,20,2,20,0)];
 case'zigzag':return [K(-150,-130,.5,-20,0),K(-40,-70,1,20),K(-80,-20,1,-15),K(45,20,1.5,20),K(0,80,.7,-10,0)];
 default:throw Error(`Unknown choreography: ${motion}`);
 }
}

const tokenEffects=new WeakMap();
const liveLayers=new WeakMap();
// Audit actual geometry and movement, excluding titles, IDs and palette.
function actorGeometry(actor){if(!DRAW[actor])throw Error(`Unknown actor: ${actor}`);return DRAW[actor];}
export function sceneVisualFingerprint(scene){return JSON.stringify(scene.actions.map((a,i)=>({shape:actorGeometry(a.actor),path:path(a.motion,i),at:a.at})));}
function actorSVG(actor){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 64 64');svg.innerHTML=actorGeometry(actor);return svg;}
export function createSceneActor(actor){return actorSVG(DRAW[actor]?actor:'star');}
function frames(motion,index,scale,angle=0){const rad=angle*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad);return path(motion,index).map(f=>({transform:`translate(calc(-50% + ${(f.x*cos-f.y*sin)*scale}px),calc(-50% + ${(f.x*sin+f.y*cos)*scale}px)) scale(${f.scale}) rotate(${f.rotate}deg)`,opacity:f.opacity}));}

export function playCharacterScene(stage,descriptor,scene,{reduced=false,direction=0,normal=false}={}){
 if(!stage?.isConnected||stage.classList.contains('cx-media-playing'))return;
 const calm=reduced||stage.closest('.calm-scene')||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 let layers=liveLayers.get(stage)||[];layers=layers.filter(x=>x.root.isConnected);while(layers.length>=3)layers.shift().dispose();
 const root=document.createElement('div');root.className=`cx-character-scene${calm?' is-quiet':''}${scene.weight==='heavy'?' is-heavy':''}${scene.palette?' palette-'+scene.palette:''}${normal?' is-normal-attack':''}`;if(scene.amplified)root.classList.add('is-amplified');root.dataset.characterScene=scene.id;root.dataset.characterEffect=descriptor.key;root.dataset.attackDirection=String(direction);root.dataset.composition=scene.actions.map(a=>`${a.actor}/${a.motion}`).join(' ');root.setAttribute('aria-hidden','true');root.style.setProperty('--scene-color',scene.palette==='destruction'?'#e1b786':descriptor.color);
 const animations=[],scale=Math.min(1,Math.max(.55,stage.clientWidth/650))*.72;
 const duration=scene.duration||2000;
 const record={root,dispose(){clearTimeout(record.timer);for(const a of animations)a.cancel();root.remove()}};
 layers.push(record);liveLayers.set(stage,layers);
 const signature=document.createElement('div');signature.className='cx-cinematic-signature';
 const icon=descriptor.skill||descriptor.portrait;if(icon){const img=document.createElement('img');img.src=icon;img.alt='';img.addEventListener('error',()=>img.remove(),{once:true});signature.append(img)}
 const label=document.createElement('span');label.textContent=scene.title;signature.append(label);root.append(signature);
 if(!calm){
  scene.actions.forEach((action,index)=>{
   const actor=document.createElement('span');actor.className=`cx-scene-actor actor-${action.actor} choreography-${action.motion}`;actor.dataset.actor=action.actor;actor.dataset.choreography=action.motion;actor.style.width=`${(action.motion==='cataclysm'?115:action.motion==='beam'?125:action.motion==='stomp'?100:88)*scale}px`;actor.style.height=`${(action.motion==='cataclysm'?140:action.motion==='beam'?72:action.motion==='stomp'?100:88)*scale}px`;actor.append(actorSVG(action.actor));root.append(actor);
   animations.push(actor.animate(frames(action.motion,index,scale,direction+(normal?index*14:0)),{duration:scene.actorDuration||(scene.weight==='heavy'?1450:1050),delay:action.at,easing:'cubic-bezier(.2,.55,.35,1)',fill:'both'}));
   const trail=document.createElement('i');trail.className=`cx-scene-trail trail-${action.motion}`;root.append(trail);animations.push(trail.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:0},{transform:`translate(-50%,-50%) scale(${(1.3+index*.3)*.72}) rotate(${index*45}deg)`,opacity:.32},{transform:`translate(-50%,-50%) scale(${(2+index*.4)*.72}) rotate(${index*75}deg)`,opacity:0}],{duration:750,delay:action.at+200,easing:'ease-out',fill:'both'}));
  });
  animations.push(signature.animate([{opacity:0,transform:'translate(-50%,10px)'},{opacity:1,transform:'translate(-50%,0)'},{opacity:1,transform:'translate(-50%,0)'},{opacity:0,transform:'translate(-50%,-6px)'}],{duration,fill:'both'}));
  const token=stage.querySelector('.cx-wish-token');if(token){tokenEffects.get(token)?.cancel();const recoil=token.animate([{transform:'scale(1)',filter:'brightness(1)'},{transform:`scale(${scene.weight==='heavy'?.88:.93}) rotate(-3deg)`,filter:'brightness(1.22)'},{transform:'scale(1.04) rotate(2deg)',filter:'brightness(1.15)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:scene.weight==='heavy'?650:470,delay:scene.impactAt||720,easing:'ease-out'});tokenEffects.set(token,recoil);animations.push(recoil)}
  if(scene.shake){const shake=scene.shake*scale;animations.push(stage.animate([{transform:'translate(0,0)'},{transform:`translate(${-shake}px,${shake*.6}px)`},{transform:`translate(${shake*.7}px,${-shake*.4}px)`},{transform:`translate(${-shake*.4}px,${shake*.2}px)`},{transform:'translate(0,0)'}],{duration:500,delay:scene.impactAt||720,easing:'ease-out'}))}
 }
 stage.append(root);stage.dataset.lastCharacterEffect=descriptor.key;stage.dataset.lastCharacterScene=scene.id;
 const footer=stage.querySelector('[data-cx-character-animation]');if(footer)footer.textContent=scene.title;
 record.timer=setTimeout(()=>record.dispose(),calm?320:duration+100);
 return {...descriptor,sceneId:scene.id,composition:scene.actions,title:scene.title,duration};
}
