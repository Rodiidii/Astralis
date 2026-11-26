// Événements Genshin vérifiés à la main dans les annonces disponibles au 25/11/2026.
// Les montants aléatoires sont séparés des récompenses garanties et les dates
// absentes des annonces restent volontairement absentes.
const EVENTS_PORTAL = 'https://www.hoyolab.com/events';
const CURATED = [
  {
    id: 'curated:gi:grand-defense-72', kind: 'event', category: 'event',
    title: 'The Grand Defense: Defy the Unjust Judgment',
    aliases: ['the grand defense', 'defy the unjust judgment'],
    start: '2026-11-04T00:00:00+01:00', end: '2026-12-16T23:59:59+01:00', noExactTime: true,
    primogems: 920, verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167148',
    rewardDetails: '920 primo-gemmes au total · Couronne de l’insight · personnage 4★ au choix',
    description: 'Événement principal de la version 7.2. Termine les opérations de secours pour obtenir les récompenses et inviter un personnage 4★.',
    sourceLabel: 'Annonce officielle · version 7.2', link: 'https://genshin.hoyoverse.com/en/news/detail/167148',
  },
  {
    id: 'curated:gi:archon-quest-72', kind: 'event', category: 'event',
    title: 'Récompenses à durée limitée · Quêtes d’Archons « Hour of Ruin »',
    aliases: ['hour of ruin', 'a yesterday sent from beyond'],
    start: '2026-11-04T11:00:00+01:00', end: '2026-12-15T14:59:00+08:00',
    primogems: 560, verified: true, verificationSource: 'https://www.hoyolab.com/article/47284167',
    rewardDetails: '560 primo-gemmes · matériaux d’élévation et autres récompenses',
    description: 'Termine les actes V et VI de la quête d’Archons avant l’échéance pour réclamer le bonus temporaire. Les quêtes restent ensuite disponibles.',
    sourceLabel: 'Annonce officielle · récompense temporaire', link: 'https://www.hoyolab.com/article/47284167',
  },
  {
    id: 'curated:gi:kristall-exploration-72', kind: 'event', category: 'event',
    title: 'Where Kristall Roots Run Deep · exploration de Snezhnaya',
    aliases: ['where kristall roots run deep', 'kristall roots'],
    start: '2026-11-04T11:00:00+01:00', end: '2027-01-26T14:59:00+08:00',
    primogems: 400, verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167187',
    rewardDetails: '400 primo-gemmes supplémentaires en terminant les missions d’exploration',
    description: 'Bonus temporaire lié aux missions d’exploration de Novokitezhgrad et de Wingspan Peak.',
    sourceLabel: 'Annonce officielle · détails de la version 7.2', link: 'https://genshin.hoyoverse.com/en/news/detail/167187',
  },
  {
    id: 'curated:gi:stygian-onslaught-72', kind: 'onslaught', category: 'endgame',
    title: 'Carnage chtonien · défis des lignes énergétiques perturbées',
    aliases: ['stygian onslaught', 'carnage chtonien'],
    start: '2026-11-11T10:00:00+01:00', end: '2026-12-15T03:59:00+01:00',
    primogems: 450, verified: true, verificationSource: 'https://www.hoyolab.com/article/47375132',
    rewardDetails: '450 primo-gemmes · récompenses de défi selon la difficulté',
    description: 'Défis de lignes énergétiques affectées par des perturbations. La période de perturbation a pris fin le 21 novembre; les défis restent accessibles jusqu’au 15 décembre.',
    sourceLabel: 'Annonce officielle · Carnage chtonien', link: 'https://www.hoyolab.com/article/47375132',
  },
  {
    id: 'curated:gi:stress-block-smashing-72', kind: 'event', category: 'event',
    title: 'Stress Block Smashing Project · défi de fouille',
    aliases: ['stress block smashing project'],
    start: '2026-11-20T10:00:00+01:00', end: '2026-11-30T03:59:00+01:00',
    primogems: 420, verified: true, verificationSource: 'https://www.hoyolab.com/article/47482557',
    rewardDetails: '420 primo-gemmes · récompenses d’événement',
    description: 'Défi de fouille. Disponible du 20 au 30 novembre; termine les étapes avant la fermeture.',
    sourceLabel: 'Annonce officielle · défi de fouille', link: 'https://www.hoyolab.com/article/47482557',
  },
  {
    id: 'curated:gi:frames-fierce-splendor-72', kind: 'event', category: 'event',
    title: 'Frames of Fierce Splendor · défi photo',
    aliases: ['frames of fierce splendor'],
    start: '2026-11-27T10:00:00+01:00', end: '2026-12-07T03:59:00+01:00',
    primogems: 420, verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167376',
    rewardDetails: '420 primo-gemmes · récompenses d’événement',
    description: 'Événement photo à venir. Il commence le 27 novembre et se termine le 7 décembre.',
    sourceLabel: 'Annonce officielle · phase II', link: 'https://genshin.hoyoverse.com/en/news/detail/167376',
  },
  {
    id: 'curated:gi:ley-line-overflow-72', kind: 'event', category: 'event',
    title: 'Flux des lignes énergétiques · butin doublé',
    aliases: ['ley line overflow'],
    start: '2026-12-07T04:00:00+01:00', end: '2026-12-14T03:59:00+01:00',
    verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167376', verifiedNoPrimos: true,
    rewardDetails: 'Butin doublé jusqu’à 3 fois par jour · aucune primo-gemme annoncée',
    description: 'Les Fleurs de la fortune et de la révélation donnent des récompenses doublées, dans la limite quotidienne de l’événement.',
    sourceLabel: 'Annonce officielle · phase II', link: 'https://genshin.hoyoverse.com/en/news/detail/167376',
  },
  {
    id: 'curated:gi:interlude-melodies-72', kind: 'event', category: 'event',
    title: 'Répertoire des mélodies · Interlude of the Long Journey',
    aliases: ['interlude of the long journey'],
    start: '2026-11-04T11:00:00+01:00', end: '2026-12-15T14:59:00+08:00',
    primogems: 60, verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167187',
    rewardDetails: '60 primo-gemmes après les missions de performance',
    description: 'Termine les missions de performance de l’album avant le 15 décembre à 14 h 59 (UTC+8).',
    sourceLabel: 'Annonce officielle · détails de la version 7.2', link: 'https://genshin.hoyoverse.com/en/news/detail/167187',
  },
  {
    id: 'curated:gi:forge-realm-endless-swarm-72', kind: 'event', category: 'event',
    title: 'Invocation des Sept · The Forge Realm’s Temper: Endless Swarm',
    aliases: ['the forge realms temper endless swarm'],
    start: '2026-11-04T11:00:00+01:00', end: '2026-12-16T03:59:00+01:00',
    verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167187', verifiedNoPrimos: true,
    rewardDetails: 'Pièces du JCC selon le score · aucune primo-gemme annoncée',
    description: 'Défi du JCC disponible pendant la version 7.2 : enchaîne les vagues et atteins les seuils de score pour récupérer les récompenses.',
    sourceLabel: 'Annonce officielle · mise à jour 7.2', link: 'https://genshin.hoyoverse.com/en/news/detail/167187',
  },
  {
    id: 'curated:gi:heated-battle-72', kind: 'event', category: 'event',
    title: 'Invocation des Sept · mode « Sprinting Stratagems »',
    aliases: ['sprinting stratagems'],
    start: '2026-11-21T10:00:00+01:00', end: '2026-12-07T03:59:00+01:00',
    verified: true, verificationSource: 'https://www.hoyolab.com/article/47493297', verifiedNoPrimos: true,
    rewardDetails: 'Récompenses du JCC · aucune primo-gemme annoncée',
    description: 'Mode spécial à règles accélérées du Jeu de cartes à collectionner Invocation des Sept.',
    sourceLabel: 'Annonce officielle Genshin Impact', link: 'https://www.hoyolab.com/article/47493297',
  },
  {
    id: 'curated:gi:hilichurls-machine-workshop-72', kind: 'web', category: 'web', externalType: 'web', externalEvent: true,
    title: 'Hilichurls’ Machine Workshop · événement web',
    aliases: ['hilichurls machine workshop'],
    start: '2026-11-04T00:00:00+01:00', end: '2026-12-13T23:59:59+01:00', noExactTime: true,
    verified: true, verificationSource: EVENTS_PORTAL,
    rewardDetails: 'Primo-gemmes, Mora, livres d’EXP et récompenses communautaires · montants selon les missions',
    description: 'Événement web actif : accomplis les missions et récupère les récompenses sur la page HoYoLAB avant sa fermeture.',
    sourceLabel: 'HoYoLAB · événement web officiel', link: EVENTS_PORTAL,
  },
  {
    id: 'curated:gi:topup-center-phase-2-72', kind: 'web', category: 'web', externalType: 'web', externalEvent: true,
    title: 'HoYoverse Top-Up Center · phase 2 de la version 7.2',
    aliases: ['version 7.2 share hoyoverse top up center event win primogems phase 2'],
    start: '2026-11-24T00:00:00+01:00', end: '2026-12-15T23:59:59+01:00', noExactTime: true,
    conditionalPrimogems: 300, conditionalReward: 'si c’est ton premier achat depuis la sortie de Luna VI', lotteryPrimos: 120, lotteryWinners: 200,
    verified: true, verificationSource: 'https://www.hoyolab.com/article/47546927',
    rewardDetails: '300 primo-gemmes si c’est ton premier achat depuis le lancement de Luna VI · concours de partage : tirage de 120 primo-gemmes pour 200 gagnants · décoration de commentaire garantie',
    description: 'Offre conditionnée à un achat au Centre de recharge. Le concours de partage est distinct : ses primo-gemmes sont attribuées par tirage au sort.',
    sourceLabel: 'HoYoLAB · Centre de recharge, phase 2', link: 'https://www.hoyolab.com/article/47546927',
  },
  {
    id: 'curated:gi:trial-of-the-usurper-72', kind: 'community', category: 'community', externalType: 'community', externalEvent: true,
    title: 'Trial of the Usurper · événement communautaire',
    aliases: ['trial of the usurper'],
    start: '2026-11-16T00:00:00+01:00', end: '2026-11-26T23:59:59+01:00', noExactTime: true,
    primogems: 40, lotteryPrimos: 160, lotteryWinners: 100,
    verified: true, verificationSource: 'https://genshin.hoyoverse.com/en/news/detail/167340',
    rewardDetails: '40 primo-gemmes garanties · tirage séparé : 160 primo-gemmes pour 100 gagnants',
    description: 'Choisis un Archon et participe via une publication ou un commentaire sur les réseaux officiels. Les 160 primo-gemmes sont un tirage au sort, pas une récompense garantie.',
    sourceLabel: 'Annonce officielle Genshin Impact', link: 'https://genshin.hoyoverse.com/en/news/detail/167340',
  },
  {
    id: 'curated:gi:topic-discussions-zibai-linnea-72', kind: 'community', category: 'community', externalType: 'community', externalEvent: true,
    title: 'Discussions Zibai & Linnea · HoYoLAB',
    aliases: ['zibai and linnea topic discussions', 'participate in zibai'],
    start: '2026-11-24T00:00:00+01:00', end: '2026-12-02T23:59:59+01:00', noExactTime: true,
    verified: true, verificationSource: EVENTS_PORTAL,
    rewardDetails: 'Cadre d’avatar garanti selon les règles · primo-gemmes possibles par tirage',
    description: 'Participe aux discussions dédiées aux deux personnages. Les récompenses de tirage sont aléatoires; consulte les règles HoYoLAB.',
    sourceLabel: 'HoYoLAB · événement communautaire officiel', link: EVENTS_PORTAL,
  },
  {
    id: 'curated:gi:genius-column-72', kind: 'community', category: 'community', externalType: 'community', externalEvent: true,
    title: 'Genius Column · concours de la version 7.2',
    aliases: ['version 7.2 genius column submission event'],
    start: '2026-11-04T00:00:00+01:00', end: '2026-12-15T23:59:00+01:00', noExactTime: true,
    verified: true, verificationSource: EVENTS_PORTAL,
    rewardDetails: 'Chance de gagner des primo-gemmes et des clefs arcaniques · concours communautaire',
    description: 'Concours de partage de guides et d’analyses du Théâtre de l’Imaginarium. Les lots dépendent du règlement et de la sélection.',
    sourceLabel: 'HoYoLAB · concours communautaire officiel', link: EVENTS_PORTAL,
  },
  {
    id: 'curated:gi:miliastra-creator-contest-72', kind: 'community', category: 'community', externalType: 'community', externalEvent: true,
    title: 'Amongst the Thousand Stars · sélection du concours Miliastra',
    aliases: ['amongst the thousand stars wonderlands creator contest'],
    start: '2026-09-23T00:00:00+01:00', end: '2026-12-12T23:59:59+01:00', noExactTime: true,
    verified: true, verificationSource: EVENTS_PORTAL,
    rewardDetails: 'Concours de création Miliastra · récompenses selon le règlement et la sélection · aucun total de primo-gemmes garanti publié',
    description: 'La période de dépôt est terminée depuis le 2 novembre. Les créations sont en cours d’évaluation jusqu’au 4 décembre; les résultats sont annoncés dans les 7 jours suivants. Aucun nouveau monde ne peut être soumis à cette phase.',
    sourceLabel: 'HoYoLAB · règlement officiel du concours', link: 'https://www.hoyolab.com/article/46792783',
  },
];

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
const matches = (row, curated) => {
  const haystack = normalize([row?.title, row?.description, row?.id].join(' '));
  return [curated.title, ...(curated.aliases || [])].some(alias => haystack.includes(normalize(alias)));
};

export function curateGenshinEvents(rows = [], scope = 'ingame') {
  const external = scope === 'external';
  const result = [...(rows || [])];
  for (const entry of CURATED) {
    if (!!entry.externalEvent !== external) continue;
    const index = result.findIndex(row => matches(row, entry));
    const previous = index >= 0 ? result[index] : {};
    const merged = {
      ...previous,
      ...entry,
      image: entry.image || previous.image || '',
      icons: entry.icons || previous.icons || [],
      source: { title: entry.sourceLabel, url: entry.link },
      curated: true,
    };
    if (index >= 0) result[index] = merged;
    else result.push(merged);
  }
  return result;
}

