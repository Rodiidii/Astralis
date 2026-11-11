export const cardSlug = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const RARITIES = Object.freeze({common:'Common',super:'Super Common',rare:'Rare',epic:'Epic',full:'Full Art',group:'Groupe',secret:'Secrète',gold:'Gold',legend:'Légende',astral:'Astrale',aeon:'Aeon',eternal:'Légende Astrale Éternelle',equipment:'Armes / Lightcones',energy:'Énergie'});
const names = text => text.split('|');
export const SPECIAL_ROSTERS = {
 full: {
  gi:names('Furina|Nahida|Neuvillette|Hu Tao|Ganyu|Arlecchino|Kamisato Ayaka|Nilou|Yelan|Eula|Klee|Mona|Keqing|Kokomi|Yae Miko|Yoimiya|Shenhe|Clorinde|Wriothesley|Tartaglia|Wanderer|Albedo'),
  hsr:names('Acheron|Firefly|Kafka|Jingliu|Ruan Mei|Feixiao|Sparkle|Robin|The Herta|Castorice|Phainon|Tribbie|Aglaea|Evernight|March 7th|Dan Heng|Himeko|Welt|Bronya|Seele|Serval|Blade|Topaz|Hanya|Xueyi'),
  ww:names('Camellya|Cantarella|Baizhi|Calcharo|Changli|Jiyan|Jinhsi|Shorekeeper|Roccia|Zani|Carlotta|Phoebe|Cartethyia'),
 },
 gold:{gi:names('Zhongli|Navia|Chiori|Raiden Shogun|Mavuika|Xilonen'),hsr:names('Huohuo|Aventurine|Kafka|Ruan Mei|Jingliu|Feixiao|Fu Xuan'),ww:names('Jinhsi|Changli|Augusta|Zani')},
 astral:{gi:names('Mitya|Alhaitham|Ronova|Istaroth'),hsr:names('Evernight|Hysilens|The Herta|Phainon|Robin'),ww:['Shorekeeper']},
 secret:{gi:names('Skirk|Rhinedottir|Nefer|Columbina|Dainsleif|Sandrone|La Signora|Alice|Nicole|Barbeloth'),hsr:names('Sunday|Cerydra|Black Swan|Sparkle|Silver Wolf|Screwllum|Rappa|Jade|Lingsha|Gallagher'),ww:names('Rover (Female)|Camellya|Cantarella|Phrolova|Scar')},
 legend:{gi:names('Focalors|Rukkhadevata|Xiao|Venti|Egeria|Makoto|Kitsune Saiguu|Guizhong|Havria|Nabu Malikata|King Deshret'),hsr:names('Cyrene|Anaxa|Aha|Akivili|Fuli|Lan|Nanook|Nous|Qlipoth|Yaoshi|Xipe|IX'),ww:names('Jue|Sentinel Imperator')},
 eternal:{gi:[],hsr:['Obsidian'],ww:[]},
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
export function buildCardCatalog(catalogs, equipment = []) {
 const cards=[];
 for(const game of ['gi','hsr','ww']) {
  const rows=(catalogs[`${game}:character`]||[]).filter(item=>!banned(item.name||item._name||item.en));
  const byName=new Map();
  for(const item of rows) for(const name of [item._name,item.name,item.en,item.enName]) if(name)byName.set(norm(name),item);
  if(byName.has('sangonomiyakokomi'))byName.set('kokomi',byName.get('sangonomiyakokomi'));
  const add=(name,rarity,item,members)=>{
   const sourceId=String(item?._id||item?.id||cardSlug(name));
   const displayName=String(name)==='{NICKNAME}'?`Pionnier · ${item?.damageType||item?.element||sourceId}`:name;
   const originalSlug=cardSlug(item?.en||item?.enName||displayName);
   const sameName=rows.filter(row=>cardSlug(row.en||row.enName||row._name||row.name)===originalSlug).length>1;
   const artSlug=originalSlug+(sameName?'-'+cardSlug(sourceId):'');
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
