export function normalizeCommandSearch(value){
  return String(value??'').toLocaleLowerCase('fr').replace(/[œ]/g,'oe').replace(/[æ]/g,'ae').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^\p{Letter}\p{Number}]+/gu,' ').trim().replace(/\s+/g,' ');
}

export function commandSearchMatches(content,query){
  const needle=normalizeCommandSearch(query);if(!needle)return true;
  const haystack=normalizeCommandSearch(content);if(!haystack)return false;
  if(haystack.replaceAll(' ','').includes(needle.replaceAll(' ','')))return true;
  return needle.split(' ').every(term=>haystack.split(' ').some(word=>word.includes(term)));
}
