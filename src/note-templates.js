export const NOTE_TEMPLATES={
 build:{label:'Build',tag:'Build',title:'Suivi de build',body:'Personnage :\nObjectif du build :\nArme et set :\nStatistiques à viser :\nPièces à améliorer :\nRésultat après essai :'},
 rotation:{label:'Rotation',tag:'Rotation',title:'Notes de rotation',body:'Équipe :\nOrdre des actions :\nDurée du cycle :\nÉnergie / recharge :\nVariantes ou erreurs :\nÀ retester :'},
 damage:{label:'Test de dégâts',tag:'Test DPS',title:'Compte rendu de dégâts',body:'Personnage et attaque testée :\nNiveau / constellation / talent :\nCible et résistance :\nBuffs actifs :\nDégâts observés :\nConditions à reproduire :'},
 character:{label:'Personnage',tag:'Personnage',title:'Notes de personnage',body:'Rôle et équipe :\nPoints forts :\nPoints à surveiller :\nBuild / arme :\nIdées et observations :'},
 farm:{label:'Farm',tag:'À faire',title:'Session de farm',body:'Personnage / objectif :\nMatériaux à récupérer :\nDomaine ou boss :\nQuantité manquante :\nProchaine session :'},
};

export function noteTemplateContent(id,{character=''}={}){
 const template=NOTE_TEMPLATES[id];
 if(!template)return null;
 const name=String(character||'').trim();
 return {...template,title:name?`${template.title} · ${name}`:template.title};
}

export function appendNoteTemplate(current,addition){
 const previous=String(current||'').trimEnd(),next=String(addition||'').trim();
 if(!next)return previous;
 return previous?`${previous}\n\n${next}`:next;
}
