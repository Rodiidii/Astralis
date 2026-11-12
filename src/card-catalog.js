export const cardSlug = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const RARITIES = Object.freeze({common:'Common',super:'Super Common',rare:'Rare',epic:'Epic',full:'Full Art',group:'Groupe',secret:'Secrète',gold:'Gold',legend:'Légende',astral:'Astrale',aeon:'Aeon',eternal:'Légende Astrale Éternelle',equipment:'Armes / Lightcones',energy:'Énergie'});
const names = text => text.split('|');
export const SPECIAL_ROSTERS = {
 full: {
  gi:names('Lisa|Barbara|Razor|Xiangling|Beidou|Xingqiu|Ningguang|Fischl|Bennett|Noelle|Chongyun|Sucrose|Jean|Kaeya|Diona|Xinyan|Rosaria|Yanfei|Yoimiya|Kujou Sara|Yun Jin|Kuki Shinobu|Shikanoin Heizou|Layla|Faruzan|Yaoyao|Dehya|Mika|Kaveh|Baizhu|Lynette|Kinich|Kachina|Emilie|Gaming'),
  hsr:names('Himeko|Welt|Bronya|Serval|Gepard|Clara|Bailu|Yanqing|Sampo|Hook|Pela|Natasha|Qingque|Tingyun|Luka|Sushang|Arlan|Asta|Herta|Dan Heng|March 7th|Trailblazer|Yukong|Dan Heng • Imbibitor Lunae|Guinaifen|Misha|Jiaoqiu|Lingsha|Gallagher|Tribbie|Hyacine|Cipher|Xueyi|Hanya|Lynx'),
  ww:names('Rover (Spectro)|Rover (Havoc)|Rover (Aero)|Encore|Calcharo|Verina|Yangyang|Chixia|Baizhi|Sanhua|Danjin|Taoqi|Mortefi|Jianxin|Lingyang|Xiangli Yao|Youhu|Lupa|Zani|Ciaccona'),
 },
 gold:{gi:names('Xilonen|Chasca|Citlali|Sangonomiya Kokomi|Nilou|Cyno|Lyney|Wriothesley|Chiori|Mualani'),hsr:names('Huohuo|Feixiao|The Herta|Fugue|Luocha|Jade|Aventurine|Boothill|Dr. Ratio'),ww:names('Yinlin|Zhezhi|Brant')},
 astral:{gi:names('Zhongli|Raiden Shogun|Venti|Mavuika|Sandrone|Columbina|Varka'),hsr:names('Acheron|Kafka|Castorice|Aglaea|Sunday|Cyrene|Jing Yuan|Seele'),ww:names('Shorekeeper|Camellya|Jinhsi|Chisa|Suoming')},
 secret:{gi:names('Rhinedottir|Shenhe|Kamisato Ayato|Arataki Itto|Tighnari|Mona|Klee|Qiqi|Xianyun|Sigewinne|Charlotte'),hsr:names('Argenti|Moze|Rappa|Anaxa|Yunli|Topaz & Numby'),ww:names('Cantarella|Phrolova|Roccia')},
 legend:{gi:names('Neuvillette|Arlecchino|Skirk|Hu Tao|Ganyu|Xiao|Kaedehara Kazuha|Yae Miko|Kamisato Ayaka|Wanderer|Clorinde|Navia|Tartaglia|Albedo|Eula|Yelan|Keqing|Diluc'),hsr:names('Firefly|Sparkle|Blade|Jingliu|Black Swan|Ruan Mei|Silver Wolf|Fu Xuan'),ww:names('Cartethyia|Changli|Phoebe|Carlotta')},
 eternal:{gi:names('Alhaitham|Furina|Mitya|Nahida|Ronova|Istaroth|Capitano'),hsr:names('Hysilens|Evernight|Obsidian|Phainon|Ashveil|Robin|Aha (forme Nihilux)|The Herta'),ww:names('Mornye|Aemeath')},
 aeon:{gi:[],hsr:names('Aha|Akivili|Fuli|Lan|Nanook|Nous|Qlipoth|Yaoshi|Xipe|IX'),ww:[]},
};
export const GROUP_ROSTERS = [
 ['gi','Équipe d’Inazuma','Raiden Shogun|Kokomi|Kamisato Ayaka|Yae Miko|Thoma'],
 ['gi','Équipe de Natlan','Mavuika|Citlali|Kinich|Xilonen|Mualani'],
 ['gi','Les Sept Archons','Venti|Zhongli|Raiden Shogun|Nahida|Furina|Mavuika'],
 ['gi','Hexenzirkel','Mona|Klee|Albedo|Sucrose'],['gi','Columbina & Sandrone','Columbina|Sandrone'],
 ['gi','Les Fatui','Arlecchino|Tartaglia|Wanderer|Lyney'],['gi','Chevaliers de Favonius','Jean|Kaeya|Lisa|Eula'],
 ['gi','Groupe de Liyue','Zhongli|Xiangling|Xingqiu|Chongyun'],['gi','Groupe de Fontaine','Furina|Neuvillette|Navia|Clorinde'],
 ['gi','Équipe de Sumeru','Alhaitham|Kaveh|Cyno|Tighnari|Dehya'],['gi','Duo de justice','Furina|Neuvillette'],
 ['hsr','Famille de Penacony','Sunday|Robin|Sparkle|Gallagher'],['hsr','Aglaea & Tribbie','Aglaea|Tribbie'],
 ['hsr','March 7th & Evernight','March 7th|Evernight'],['hsr','Héritiers de Chrysos','Phainon|Tribbie|Mydei|Castorice|Anaxa'],
 ['hsr','Cerydra & Hysilens','Cerydra|Hysilens'],['hsr','Madame Herta & Herta','The Herta|Herta'],
 ['hsr','Étudiants de Lâh-Roi','Anaxa|Tribbie|Mydei'],['hsr','Astral Express','March 7th|Dan Heng|Himeko|Welt'],
 ['hsr','Chasseurs de Stellaron','Kafka|Silver Wolf|Blade|Firefly'],['hsr','Gardiens de Belobog','Bronya|Gepard|Seele|Serval'],
 ['hsr','Commission des Dix Seigneurs','Fu Xuan|Qingque|Hanya|Xueyi'],
 ['ww','Résonateurs de Rinascita','Phoebe|Cartethyia|Zani|Carlotta'],['ww','Camellya & Shorekeeper','Camellya|Shorekeeper'],
 ['ww','Jinhsi & Changli','Jinhsi|Changli'],['ww','Phoebe & Cartethyia','Phoebe|Cartethyia'],
 ['ww','Équipe de Jinzhou','Jiyan|Yangyang|Chixia|Baizhi'],['ww','Black Shores','Shorekeeper|Aalto|Camellya'],
 ['ww','Fractsidus','Scar|Phrolova'],['ww','Jiyan & Mortefi','Jiyan|Mortefi'],
].map(([game,name,members])=>({game,name,members:names(members)}));
const norm = value => cardSlug(value).replaceAll('-','');
const banned = value => /lauma/i.test(String(value));
const sourceAliases=Object.freeze({
 'aha-forme-nihilux':'aha',
 'topaz-numby':'topaz',
 'rover-spectro':'rover',
 'rover-havoc':'rover',
 'rover-aero':'rover',
});
export function buildCardCatalog(catalogs, equipment = []) {
 const cards=[];
 for(const game of ['gi','hsr','ww']) {
  const rows=(catalogs[`${game}:character`]||[]).filter(item=>!banned(item.name||item._name||item.en));
  const byName=new Map();
  for(const item of rows) for(const name of [item._name,item.name,item.en,item.enName]) if(name)byName.set(norm(name),item);
  if(byName.has('sangonomiyakokomi'))byName.set('kokomi',byName.get('sangonomiyakokomi'));
  const add=(name,rarity,item,members)=>{
   const requestedSlug=cardSlug(name),sourceName=sourceAliases[requestedSlug],variantRover=/^Rover\s*\((?:Spectro|Havoc|Aero)\)$/i.test(name);
   item=item||byName.get(norm(sourceName||''));
   const baseSourceId=String(item?._id||item?.id||cardSlug(sourceName||name));
   const sourceId=variantRover?`${baseSourceId}-${requestedSlug}`:baseSourceId;
   const displayName=String(name)==='{NICKNAME}'?`Pionnier · ${item?.damageType||item?.element||sourceId}`:name;
   const originalSlug=cardSlug(item?.en||item?.enName||sourceName||displayName);
   const sameName=rows.filter(row=>cardSlug(row.en||row.enName||row._name||row.name)===originalSlug||norm(row._name||row.name||row.en||row.enName)===norm(displayName)).length>1;
   const artSlug=variantRover?requestedSlug:originalSlug+(sameName?'-'+cardSlug(sourceId):'');
   const id=members?`${game}-group-${cardSlug(name)}-group`:`${game}-char-${cardSlug(sourceId)}-${rarity}`;
   if(cards.some(card=>card.id===id))return;
   cards.push({id,game,name:displayName,rarity,rarityLabel:RARITIES[rarity],kind:members?'group':'character',categoryLabel:members?'Groupe':'Personnage',sourceId,
    artSlug,element:item?.elementText||item?.element||item?.damageType||'',_item:item,members,
    number:`${game.toUpperCase()}-${rarity.toUpperCase()}-${cardSlug(sourceId).toUpperCase()}`,cardArtIndex:0});
  };
  for(const item of rows)for(const rarity of ['common','super','rare','epic'])add(item._name||item.name||item.en,rarity,item);
  for(const [rarity,games] of Object.entries(SPECIAL_ROSTERS))for(const name of games[game]||[])add(name,rarity,byName.get(norm(name)));
  for(const group of GROUP_ROSTERS.filter(group=>group.game===game))add(group.name,'group',null,group.members);
 }
 for(const card of equipment) if(!banned(card.name))cards.push({...card,artSlug:cardSlug(card.name)});
 for(const [game,types] of Object.entries({gi:['Pyro','Hydro','Cryo','Electro','Dendro','Anemo','Geo'],hsr:['Physical','Fire','Ice','Lightning','Wind','Quantum','Imaginary','Destruction','The Hunt','Erudition','Harmony','Nihility','Preservation','Abundance','Remembrance','Elation']}))
  for(const name of types)cards.push({id:`${game}-energy-${cardSlug(name)}`,game,name:`Énergie · ${name}`,artSlug:`energy-${cardSlug(name)}`,element:name,kind:'energy',rarity:'energy',rarityLabel:RARITIES.energy,number:`${game.toUpperCase()}-EN-${cardSlug(name).toUpperCase()}`});
 return cards;
}
