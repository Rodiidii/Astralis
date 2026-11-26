// Individually composed clicker scenes. Syntax: actor / choreography.
// The compositions are creations for Astralis, not recordings of game skills.
const DATA = `
gi:capitano|Serment du Capitaine|capitanomask/guard greatsword/cross frostseal/wake
gi:dainsleif|Gardien du rameau|abyssarm/draw khaenriahseal/open fracture/beam
gi:ronova|Ailes de la Mort|deathwings/open feather/swoop scythe/close
gi:istaroth|Reflux des instants|hourglass/turnhour timewheel/rewind ribbon/return
gi:naberius|Souffle de la Vie|lifesigil/germinate vine/rise flower/open
gi:asmoday|Verrou spatial|spacecube/roll spacecage/spacelock pixel/shatter
hsr:obsidian|Toast d’obsidienne|obsidianstone/rise goblet/toast bat/swoop
gi:10000005|Sillage du voyageur|blade/dash wind/spiral star/impact
gi:10000121|Atelier d’Aino|gear/roll wave/pour bubble/rise
gi:10000038|Éclosion d’Albedo|flower/open crystal/rise sun/impact
gi:10000078|Miroirs d’Alhaitham|mirror/open blade/cross prism/rain
gi:10000062|Chasse d’Aloy|bomb/lob arrow/dash ice/impact
gi:10000148|Étoile d’Alyosha|star/swoop book/open crystal/impact
gi:10000021|Baron Lapin|rabbit/lob rabbit/hop flame/explode
gi:10000057|Charge d’Ushi|bull/dash club/roll rock/explode
gi:10000096|Faux écarlate|scythe/draw flame/spiral wing/open
gi:10000082|Serpent de jade|serpent/weave leaf/rain shield/open
gi:10000014|Concert de Barbara|music/orbit bubble/pour music/impact
gi:10000024|Riposte de Beidou|shield/open lightning/cross wave/explode
gi:10000032|Aventure de Bennett|blade/stomp flame/ring cross/open
gi:10000072|Bouclier de Candace|shield/roll spear/dash wave/ring
gi:10000088|Flash de Charlotte|camera/summon frame/close ice/flash
gi:10000104|Chevauchée de Chasca|gun/swoop bullet/rain wind/impact
gi:10000090|Salve de Chevreuse|gun/draw bullet/dash flame/impact
gi:10000094|Brocart de Chiori|doll/summon thread/weave blade/cross
gi:10000036|Exorcisme de Chongyun|blade/rain ice/rise seal/impact
gi:10000107|Rêve de Citlali|pillow/lob star/orbit shield/open
gi:10000098|Duel de Clorinde|gun/dash bullet/cross blade/draw
gi:10000067|Retour de Collei|boomerang/return leaf/spiral cat/summon
gi:10000125|Voile de Columbina|wing/open moon/rise wave/pour
gi:10000071|Jugement de Cyno|claw/cross lightning/stomp eye/flash
gi:10000115|Rosée de Dahlia|bell/swing bubble/rise shield/ring
gi:10000079|Griffes de Dehya|claw/dash claw/cross flame/explode
gi:10000016|Aube de Diluc|blade/draw phoenix/swoop flame/wake
gi:10000039|Cocktail de Diona|paw/rain bottle/lob ice/ring
gi:10000068|Lampe de Dori|lamp/summon thread/weave coin/rain
gi:10000123|Envol de Durin|dragon/rise wing/open flame/rain
gi:10000099|Flacon d’Émilie|bottle/summon flower/open leaf/pour
gi:10000112|Cuisine d’Escoffier|pot/summon spoon/swing ice/rain
gi:10000051|Lame d’Eula|lightblade/rise lightblade/stomp ice/explode
gi:10000076|Géométrie de Faruzan|prism/open arrow/dash wind/ring
gi:10000031|Envol d’Oz|raven/summon raven/swoop lightning/wake
gi:10000120|Lanterne de Flins|lantern/swing lightning/rise moon/impact
gi:10000085|Plongée de Fréminet|penguin/lob gear/roll ice/impact
gi:10000089|Salon de Furina|crab/dash octopus/hop seahorse/swoop
gi:10000092|Danse de Gaming|lion/lob lion/stomp flame/ring
gi:10000037|Floraison de Ganyu|lotus/summon arrow/lob ice/rain
gi:10000055|Étendard de Gorou|banner/rise paw/dash rock/rain
gi:10000046|Fantôme de Hu Tao|ghost/swoop butterfly/spiral flame/wake
gi:10000110|Cadence d’Iansan|foot/stomp lightning/ring drum/impact
gi:10000113|Envol d’Ifa|bird/swoop bottle/pour wind/ring
gi:10000127|Lanterne d’Illuga|lantern/rise prism/orbit moon/open
gi:10000116|Circuit d’Ineffa|robot/summon gear/roll lightning/cross
gi:10000124|Courrier de Jahoda|feather/dash scroll/return wind/wake
gi:10000003|Brise de Jean|blade/rise dandelion/open wind/spiral
gi:10000100|Forage de Kachina|drill/rise drill/roll rock/explode
gi:10000047|Érables de Kazuha|blade/rise maple/spiral wind/ring
gi:10000015|Valse de Kaeya|ice/orbit blade/draw ice/cross
gi:10000002|Cerisier d’Ayaka|fan/open petal/weave ice/wake
gi:10000066|Reflet d’Ayato|mirror/summon blade/cross wave/rain
gi:10000081|Architecture de Kaveh|case/open frame/close leaf/explode
gi:10000042|Éclair de Keqing|blade/lob lightning/dash blade/cross
gi:10000101|Chasse de Kinich|pixel/roll hook/return dragon/dash
gi:10000061|Livraison de Kirara|box/dash cat/hop leaf/explode
gi:10000029|Rebond de Dodoco|dodoco/lob dodoco/hop flame/explode
gi:10000056|Ailes de Sara|wing/open feather/rain lightning/stomp
gi:10000065|Anneau de Shinobu|blade/roll thread/orbit lightning/ring
gi:10000108|Rubans de Lan Yan|ribbon/weave shield/roll wind/impact
gi:10000119|Couronne de Lauma|antler/open leaf/pour moon/ring
gi:10000074|Sommeil de Layla|shield/open star/orbit ice/rain
gi:10000130|Atelier de Linnea|book/open gear/orbit flower/rise
gi:10000006|Potions de Lisa|bottle/lob shards/shatter potioncloud/alchemy
gi:10000129|Lame de Lohen|blade/draw flame/pour crystal/stomp
gi:10000007|Lumière de Lumine|star/open blade/return wind/impact
gi:10000083|Tour de Lynette|hat/summon cat/hop wind/pour
gi:10000084|Cartes de Lyney|card/rain hat/open cat/explode
gi:10000117|Atelier de Manekin|gear/summon blade/dash star/ring
gi:10000118|Rubans de Manekina|ribbon/orbit blade/rise star/pour
gi:10000106|Soleil de Mavuika|motorcycle/roll motorcycle/dash sun/explode
gi:10000080|Cartes de Mika|book/open arrow/dash feather/rain
gi:10000041|Astres de Mona|star/orbit mirror/open wave/explode
gi:10000102|Surf de Mualani|shark/swoop wave/wake bubble/explode
gi:10000073|Sanctuaire de Nahida|frame/close leaf/orbit lotus/open
gi:10000091|Ombrelle de Navia|umbrella/open bullet/cross crystal/rain
gi:10000122|Voiles de Nefer|ribbon/swoop mask/open leaf/rain
gi:10000087|Marée de Neuvillette|dragon/open wave/beam bubble/wake
gi:10000131|Livre de Nicole|book/rise quill/weave star/rain
gi:10000070|Danse de Nilou|lotus/open ribbon/orbit wave/ring
gi:10000027|Jade de Ningguang|gate/rise crystal/rain jade/dash
gi:10000034|Rempart de Noëlle|shield/open blade/roll rose/ring
gi:10000150|Arabesque d’Odette|ribbon/weave crystal/spiral feather/rain
gi:10000105|Écho d’Ororon|bat/open wing/swoop lightning/rain
gi:10000132|Jardin de Prune|flower/rise fruit/lob leaf/ring
gi:10000035|Talismans de Qiqi|seal/orbit ice/return cross/ring
gi:10000052|Œil de Raiden|eye/open lightning/beam blade/draw
gi:10000020|Loup de Razor|wolf/open claw/cross lightning/explode
gi:10000045|Lance de Rosalia|spear/stomp ice/rise petal/rain
gi:10000133|Atelier de Sandrone|doll/summon gear/open thread/close
gi:10000054|Méduse de Kokomi|jellyfish/rise fish/orbit bubble/ring
gi:10000053|Roulade de Sayu|tanuki/summon wheel/roll wind/wake
gi:10000097|Visée de Sethos|eye/close arrow/beam lightning/wake
gi:10000063|Esprit de Shenhe|seal/rain spirit/swoop ice/ring
gi:10000059|Poing de Heizou|fist/dash wind/close wind/explode
gi:10000095|Soin de Sigewinne|bubble/lob heart/rise wave/beam
gi:10000114|Néant de Skirk|portal/open blade/spiral slash/cross
gi:10000043|Expérience de Sucrose|bottle/lob butterfly/open wind/spiral
gi:10000033|Marée de Tartaglia|blade/cross whale/rise wave/stomp
gi:10000050|Bouclier de Thomas|spear/roll shield/open flame/ring
gi:10000069|Flèches de Tighnari|flower/lob arrow/return leaf/explode
gi:10000111|Bond de Varesa|fist/lob foot/stomp lightning/ring
gi:10000128|Charge de Varka|blade/cross wolf/dash wind/wake
gi:10000022|Ballade de Venti|lyre/summon feather/spiral vortex/open
gi:10000143|Éclosion de Vesna|flower/open ribbon/rise leaf/orbit
gi:10000140|Marée de Vodyanitsa|wave/rise mirror/orbit bubble/pour
gi:10000075|Envol du Nomade|hat/roll wind/rise blade/rain
gi:10000086|Poings de Wriothesley|fist/dash fist/cross ice/explode
gi:10000023|Cuisine de Xiangling|bear/summon flame/pour spear/roll
gi:10000093|Grue de Xianyun|crane/open crane/lob wind/stomp
gi:10000026|Masque de Xiao|mask/open spear/lob spear/stomp
gi:10000103|Rythme de Xilonen|skate/dash speaker/open rock/ring
gi:10000025|Épées de Xingqiu|book/open blade/orbit wave/cross
gi:10000044|Concert de Xinyan|guitar/swing flame/rise music/explode
gi:10000058|Renards de Yae Miko|fox/summon shrine/rise lightning/rain
gi:10000048|Sceau de Yanfei|seal/rise book/open flame/stomp
gi:10000077|Récolte de Yaoyao|rabbit/summon radish/lob leaf/ring
gi:10000060|Dé de Yelan|dice/roll thread/weave arrow/cross
gi:10000049|Festival de Yoimiya|arrow/rise firework/open flame/rain
gi:10000109|Rêve de Mizuki|pillow/swoop fan/swing wind/spiral
gi:10000064|Opéra de Yun Jin|banner/swing spear/draw music/ring
gi:10000030|Météore de Zhongli|column/rise meteor/lob rock/explode
gi:10000126|Reflets de Zibai|mirror/rise moon/orbit jade/rain
gi:10000134|Voie du voyageur|compass/rise blade/weave star/stomp
gi:10000136|Noyau de Mitya|core/summon beacon/orbit lightning/beam
gi:10000137|Mortier de Valeriy|shield/rise mortar/lob shell/explode
gi:10000147|Ancre de Danica|chain/weave anchor/stomp lightning/ring
gi:10000149|Étoile polaire d’Anastasya|crown/open bow/rise frostseal/close
hsr:1001|Souvenir de Mars|camera/flash arrow/lob ice/open
hsr:1002|Lance de Dan Heng|spear/dash feather/cross wind/wake
hsr:1003|Frappe orbitale d’Himeko|satellite/open beam/rain flame/explode
hsr:1004|Gravité de Welt|cane/draw portal/close rock/orbit
hsr:1005|Fils de Kafka|thread/weave gun/cross lightning/rain
hsr:1006|Piratage de Silver Wolf|pixel/rain frame/close glitch/flash
hsr:1008|Lame d’Arlan|blade/rise lightning/stomp shield/explode
hsr:1009|Météores d’Asta|telescope/open comet/rain star/explode
hsr:1013|Marteau d’Herta|hammer/roll hammer/stomp ice/ring
hsr:1014|Lame de Saber|blade/rise wind/close beam/dash
hsr:1015|Projection d’Archer|bow/open blade/rain arrow/cross
hsr:1101|Commandement de Bronya|banner/rise gun/draw feather/wake
hsr:1102|Éclair de Seele|butterfly/spiral scythe/dash portal/close
hsr:1103|Concert de Serval|guitar/swing music/cross lightning/ring
hsr:1104|Rempart de Gepard|shield/rise ice/close fist/stomp
hsr:1105|Soin de Natasha|bottle/lob heart/open cross/rain
hsr:1106|Analyse de Pela|book/open frame/close ice/beam
hsr:1107|Protection de Clara|robot/rise fist/dash shield/impact
hsr:1108|Cartes de Sampo|card/cross wind/weave dagger/return
hsr:1109|Aventure de Hook|drill/dash flame/lob bomb/explode
hsr:1110|Exploration de Lynx|can/summon fish/lob heart/ring
hsr:1111|Poing de Luka|fist/roll gear/close fist/impact
hsr:1112|Course de Numby|pig/dash coin/rain gun/draw
hsr:1201|Tuiles de Qingque|tile/orbit tile/close jade/explode
hsr:1202|Bénédiction de Tingyun|fan/open fox/swoop lightning/ring
hsr:1203|Jardin de Luocha|coffin/open flower/rise cross/ring
hsr:1204|Seigneur de Jing Yuan|thunderlord/open spear/stomp lightning/rain
hsr:1205|Lame de Blade|blade/draw flower/close slash/cross
hsr:1206|Phénix de Sushang|chicken/lob blade/rain feather/explode
hsr:1207|Arc de Yukong|bow/rise arrow/beam feather/wake
hsr:1208|Matrice de Fu Xuan|eye/open frame/close prism/orbit
hsr:1209|Épées de Yanqing|blade/orbit blade/rain ice/cross
hsr:1210|Festival de Guinaifen|gong/swing firework/open flame/wake
hsr:1211|Soin de Bailu|dragon/swoop bubble/rain heart/open
hsr:1212|Croissant de Jingliu|moon/rise blade/draw ice/wake
hsr:1213|Dragon de Lunae|lotus/open dragon/spiral wave/beam
hsr:1214|Chaînes de Xueyi|chain/weave dagger/cross prism/explode
hsr:1215|Sceaux de Hanya|quill/draw seal/close chain/rain
hsr:1217|Talismans de Huohuo|flag/swing spirit/swoop wind/ring
hsr:1218|Braise de Jiaoqiu|pot/open petal/rain flame/pour
hsr:1220|Chasse de Feixiao|axe/cross fox/swoop wind/impact
hsr:1221|Parade de Yunli|blade/stomp shield/close rock/explode
hsr:1222|Encens de Lingsha|censer/summon rabbit/swoop flame/ring
hsr:1223|Plumes de Moze|feather/rain dagger/dash lightning/impact
hsr:1224|Apprentissage de Mars|blade/roll tea/pour petal/cross
hsr:1225|Flammes de Fugue|fan/swing fox/open flame/spiral
hsr:1301|Cocktail de Gallagher|glass/summon claw/dash flame/rain
hsr:1302|Roses d’Argenti|rose/open spear/draw petal/rain
hsr:1303|Musique de Ruan Mei|instrument/swing plum/open music/ring
hsr:1304|Pari d’Aventurine|dice/lob coin/rain shield/open
hsr:1305|Leçon du Dr Ratio|book/open pillar/lob chalk/dash
hsr:1306|Masques de Sparkle|mask/roll firework/close fish/swoop
hsr:1307|Souvenir de Black Swan|card/orbit thread/close flower/open
hsr:1308|Néant d’Acheron|sheath/draw blade/beam rain/pour
hsr:1309|Concert de Robin|mic/rise wing/open music/pour
hsr:1310|Propulsion de Firefly|robot/open wing/dash flame/wake
hsr:1312|Bagages de Misha|case/lob key/rain ice/explode
hsr:1313|Harmonie de Sunday|wing/rise halo/open feather/rain
hsr:1314|Contrat de Jade|coin/roll serpent/weave jade/rain
hsr:1315|Duel de Boothill|gun/roll bullet/dash bullet/cross
hsr:1317|Graffiti de Rappa|shuriken/cross paint/pour pixel/rain
hsr:1321|Jardin de Dahlia|flower/orbit ribbon/weave flame/impact
hsr:1401|Clé de The Herta|key/roll book/rise ice/explode
hsr:1402|Fils d’Aglaea|doll/rise thread/weave needle/cross
hsr:1403|Portails de Tribbie|gate/open star/lob prism/ring
hsr:1404|Rugissement de Mydei|lion/rise fist/stomp flame/explode
hsr:1405|Alchimie d’Anaxa|book/open rifle/rain prism/explode
hsr:1406|Larcin de Cipher|cat/dash coin/return blade/cross
hsr:1407|Dragon de Castorice|butterfly/open dragon/swoop moon/impact
hsr:1408|Météorite de Phainon|ruinmeteor/meteorfall fracture/aftershock ember/debris
hsr:1409|Nuages de Hyacine|pony/lob cloud/pour heart/ring
hsr:1410|Vagues de Hysilens|instrument/open wave/spiral fish/rain
hsr:1412|Couronne de Cerydra|crown/rise banner/open prism/beam
hsr:1413|Miroir d’Evernight|mirror/open moon/close ice/rain
hsr:1414|Terre de Dan Heng|dragon/rise shield/orbit rock/stomp
hsr:1415|Souvenir de Cyrene|flower/weave clock/roll star/pour
hsr:1501|Scène de Sparxie|mask/rise music/cross firework/rain
hsr:1502|Astres de Yao Guang|star/roll seal/open prism/rain
hsr:1503|Reflets de Pearl|pearl/open wave/orbit coin/return
hsr:1504|Voile d’Ashveil|veil/weave blade/swoop moon/close
hsr:1505|Éclosion d’Evanescia|flower/spiral wing/rise star/impact
hsr:1506|Silver Wolf niveau 999|pixel/close glitch/dash beam/cross
hsr:1507|Lame de Mortenax|blade/swoop portal/rise slash/rain
hsr:1508|Joyaux de Rin|gem/lob seal/open prism/explode
hsr:1509|Portes de Gilgamesh|gate/rise blade/rain coin/impact
hsr:1510|Nova d’Himeko|satellite/roll sun/open beam/stomp
hsr:1511|Mascarade d’Aha|mask/orbit card/rain firework/explode
hsr:1512|Été de Robin|mic/swing bubble/spiral music/rain
hsr:1513|Marées d’Aventurine|dice/roll wave/pour coin/explode
hsr:8001|Pionnier au combat|baseballbat/draw star/stomp rock/ring
hsr:8002|Pionnière au combat|baseballbat/roll star/dash rock/explode
hsr:8003|Pionnier protecteur|spear/rise shield/close flame/rain
hsr:8004|Pionnière protectrice|spear/dash shield/open flame/stomp
hsr:8005|Pionnier harmonique|hat/open music/orbit star/pour
hsr:8006|Pionnière harmonique|hat/roll music/weave star/rain
hsr:8007|Pionnier du souvenir|spirit/lob book/open ice/ring
hsr:8008|Pionnière du souvenir|spirit/rise book/close ice/pour
hsr:8009|Pionnier des horizons|compass/roll blade/rise star/cross
hsr:8010|Pionnière des horizons|compass/open blade/return star/spiral
ww:1402|Plumes de Yangyang|feather/open blade/weave wind/wake
ww:1202|Tirs de Chixia|gun/cross bullet/rain flame/impact
ww:1503|Serre de Verina|vine/rise flower/open heart/pour
ww:1501|Écho du Rover|blade/draw sun/close wave/ring
ww:1102|Glace de Sanhua|blade/draw ice/rise crystal/explode
ww:1601|Parade de Taoqi|blade/roll shield/close wave/explode
ww:1502|Écho de la Rover|blade/return sun/open wave/cross
ww:1103|Soin de Baizhi|youTan/summon ice/orbit cross/pour
ww:1203|Laine d’Encore|sheep/lob sheep/hop flame/explode
ww:1602|Lames de Danjin|blade/cross petal/close slash/impact
ww:1403|Brume d’Aalto|mist/open gun/draw wind/wake
ww:1404|Dragon de Jiyan|spear/roll dragon/dash wind/explode
ww:1204|Salve de Mortefi|gun/draw dragon/open bullet/rain
ww:1603|Lianes de Camellya|vine/weave petal/spiral flower/explode
ww:1301|Fantômes de Calcharo|spirit/dash blade/cross lightning/stomp
ww:1302|Marionnette de Yinlin|doll/lob thread/close lightning/pour
ww:1104|Lion de Lingyang|lion/hop pillar/rise ice/stomp
ww:1303|Poings de Yuanwu|fist/cross column/rise lightning/ring
ww:1604|Aile du Rover Havoc|wing/open blade/draw portal/explode
ww:1605|Aile de la Rover Havoc|wing/rise blade/cross portal/close
ww:1405|Spirale de Jianxin|fist/roll wind/close shield/open
ww:1304|Dragon de Jinhsi|dragon/orbit pearl/rise beam/stomp
ww:1305|Circuit de Xiangli Yao|gear/close fist/dash lightning/beam
ww:1205|Phénix de Changli|phoenix/rise feather/weave flame/stomp
ww:1105|Encre de Zhezhi|brush/draw crane/swoop petal/pour
ww:1504|Élan de Lumi|mouse/dash lightning/weave gear/roll
ww:1106|Curiosités de Youhu|pot/roll bell/swing ice/explode
ww:1505|Rivages de Shorekeeper|butterfly/spiral gate/open star/rain
ww:1606|Scène de Roccia|case/open spirit/lob ribbon/close
ww:1107|Cristaux de Carlotta|gun/draw gem/rain ice/beam
ww:1206|Spectacle de Brant|anchor/lob boat/swoop flame/wake
ww:1506|Lumière de Phoebe|book/rise prism/open beam/pour
ww:1406|Souffle du Rover Aero|blade/roll feather/rise wind/beam
ww:1607|Rêve de Cantarella|jellyfish/summon umbrella/roll bubble/pour
ww:1407|Chanson de Ciaccona|instrument/draw music/orbit wind/rain
ww:1507|Parade de Zani|shield/dash horn/open flame/cross
ww:1408|Souffle de la Rover Aero|blade/lob feather/weave wind/impact
ww:1207|Chasse de Lupa|wolf/dash claw/cross flame/rise
ww:1608|Orchestre de Phrolova|baton/swing spirit/rise music/explode
ww:1409|Marée de Cartethyia|blade/rise dragon/weave wave/ring
ww:1306|Soleil d’Augusta|blade/stomp sun/open lightning/rain
ww:1410|Lune d’Iuno|moon/roll bow/open wind/pour
ww:1307|Sceaux de Buling|seal/lob lightning/orbit mist/rain
ww:1208|Visée de Galbrena|gun/rise bullet/beam flame/wake
ww:1508|Ciseaux de Chisa|scissors/cross ribbon/close flower/rain
ww:1411|Lame de Qiuyuan|blade/draw maple/weave wind/impact
ww:1509|Prismes de Lynae|prism/dash camera/flash star/rain
ww:1209|Atelier de Mornye|gear/rise book/roll flame/pour
ww:1510|Rayons de Luuk Herssen|fist/return sun/close beam/rain
ww:1210|Ailes d’Aemeath|wing/weave flame/rise star/explode
ww:1412|Sillage de Sigrika|blade/swoop leaf/close wind/rain
ww:1211|Scène de Denia|ribbon/rise mask/roll flame/pour
ww:1308|Salve de Rebecca|gun/roll bullet/return lightning/rain
ww:1109|Étoile de Lucilla|star/summon ice/weave crystal/stomp
ww:1511|Lueur de Lucy|book/lob heart/rise sun/ring
ww:1108|Lame de Hiyuki|blade/draw snow/rain ice/close
ww:1309|Rover de l’Électro|blade/cross lightning/spiral eye/open
ww:1310|Rover de la foudre|blade/roll lightning/rise eye/close
ww:1610|Envol de Xuanling|feather/spiral dragon/swoop wind/pour
ww:1110|Ronde de Suisui|bell/roll snow/orbit crystal/rain
ww:1413|Brise de Qingxiao|fan/draw cloud/swoop wind/ring
ww:1311|Impulsion de Hsin|fist/rise lightning/return gear/explode
ww:1212|Braises de Jingran|blade/weave flame/close sun/stomp
ww:1312|Circuit de Suoming|thread/cross gear/rise lightning/pour
ww:1512|Jardin de Lily|flower/summon leaf/rise star/spiral
`;

export const CHARACTER_SCENES = Object.fromEntries(DATA.trim().split('\n').map(line=>{
 const [id,title,...actions]=line.split('|');return [id,{id,title,actions:actions.join(' ').split(/\s+/).map((action,index)=>{const [actor,motion]=action.split('/');return {actor,motion,at:[0,260,690][index]};})}];
}));

// Lore-driven timing overrides: anticipation, impact and aftermath are authored.
Object.assign(CHARACTER_SCENES['gi:10000006'],{duration:2300,impactAt:620,palette:'alchemy'});
CHARACTER_SCENES['gi:10000006'].actions[1].at=500;
CHARACTER_SCENES['gi:10000006'].actions[2].at=780;
Object.assign(CHARACTER_SCENES['hsr:1408'],{duration:2100,actorDuration:1050,impactAt:620,weight:'heavy',shake:1.5,palette:'destruction'});
CHARACTER_SCENES['hsr:1408'].actions[1].at=500;
CHARACTER_SCENES['hsr:1408'].actions[2].at=760;

// Lore guests: deliberate pauses make the hourglass flip and spatial lock legible.
Object.assign(CHARACTER_SCENES['gi:istaroth'],{duration:2500,actorDuration:1500});
Object.assign(CHARACTER_SCENES['gi:asmoday'],{duration:2300,actorDuration:1300});
