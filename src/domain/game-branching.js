const THEME_TO_STATE = {
  career: ['opportunity', 'stability'],
  wealth: ['resources', 'stability'],
  relationship: ['relationship', 'pressure'],
  health: ['wellbeing', 'pressure'],
  mindset: ['pressure', 'wellbeing', 'stability'],
  family: ['relationship', 'resources', 'stability'],
  migration: ['opportunity', 'stability'],
};

const THEME_BASE_PRIORITY = (lifeState = {}, routeStyle = 'steady') => {
  const pressure = Number(lifeState.pressure || 50);
  const opportunity = Number(lifeState.opportunity || 50);
  const relationship = Number(lifeState.relationship || 50);
  const stability = Number(lifeState.stability || 50);
  const resources = Number(lifeState.resources || 50);
  const wellbeing = Number(lifeState.wellbeing || 50);

  const pressureNeed = Math.max(0, pressure - 60);
  const relationshipNeed = Math.max(0, 52 - relationship);
  const stabilityNeed = Math.max(0, 52 - stability);
  const resourcesNeed = Math.max(0, 52 - resources);
  const wellbeingNeed = Math.max(0, 52 - wellbeing);
  const opportunityWindow = Math.max(0, opportunity - 58);

  const priorities = {
    career: opportunityWindow * 1.1 + (routeStyle === 'bold' ? 8 : 0) + (routeStyle === 'steady' ? 2 : 0),
    wealth: resourcesNeed * 1.1 + stabilityNeed * 0.8 + (routeStyle === 'steady' ? 5 : 0),
    relationship: relationshipNeed * 1.2 + pressureNeed * 0.5 + (routeStyle === 'repair' ? 6 : 0),
    health: wellbeingNeed * 1.3 + pressureNeed * 1.1 + (routeStyle === 'repair' ? 8 : 0),
    mindset: pressureNeed * 0.9 + wellbeingNeed * 0.6 + stabilityNeed * 0.5 + (routeStyle === 'steady' ? 3 : 0),
    family: relationshipNeed * 0.8 + resourcesNeed * 0.5 + stabilityNeed * 0.6,
    migration: opportunityWindow * 0.8 + (routeStyle === 'bold' ? 6 : 0) - stabilityNeed * 0.2,
  };

  return priorities;
};

const stateNeed = (key, lifeState = {}) => {
  const value = Number(lifeState[key] || 50);
  if (key === 'pressure') {
    return Math.max(0, value - 55);
  }
  return Math.max(0, 55 - value);
};

const cardStatePotential = (card = {}) => {
  const bestPositive = {
    pressure: 0,
    opportunity: 0,
    relationship: 0,
    stability: 0,
    resources: 0,
    wellbeing: 0,
  };

  (card.choices || []).forEach((choice) => {
    const delta = choice.stateEffects || {};
    Object.keys(bestPositive).forEach((key) => {
      if (Number(delta[key] || 0) > bestPositive[key]) {
        bestPositive[key] = Number(delta[key] || 0);
      }
      if (key === 'pressure' && Number(delta[key] || 0) < 0) {
        bestPositive[key] = Math.max(bestPositive[key], Math.abs(Number(delta[key] || 0)));
      }
    });
  });

  return bestPositive;
};

const dynamicScore = ({ card, lifeState, routeStyle }) => {
  const themePriority = THEME_BASE_PRIORITY(lifeState, routeStyle);
  const themeScore = themePriority[card.theme] || 0;
  const themeStates = THEME_TO_STATE[card.theme] || [];
  const potential = cardStatePotential(card);

  const repairScore = themeStates.reduce((total, key) => (
    total + (stateNeed(key, lifeState) * (potential[key] || 0))
  ), 0);

  const opportunityBoost = card.type === 'opportunity' && Number(lifeState.opportunity || 50) >= 62 ? 6 : 0;
  const pressurePenalty = card.theme === 'career' && Number(lifeState.pressure || 50) >= 75 ? 4 : 0;
  const routeBoost = (
    (routeStyle === 'bold' && ['career', 'migration'].includes(card.theme))
    || (routeStyle === 'steady' && ['wealth', 'mindset', 'family'].includes(card.theme))
    || (routeStyle === 'repair' && ['health', 'relationship'].includes(card.theme))
  ) ? 5 : 0;

  return themeScore + (repairScore * 0.15) + opportunityBoost + routeBoost - pressurePenalty;
};

export const orderCardsForLifeState = ({
  cards = [],
  lifeState = {},
  routeStyle = 'steady',
  completedIds = [],
}) => {
  const completedSet = new Set(completedIds);
  const pending = cards.filter((card) => !completedSet.has(card.id));
  return pending
    .map((card) => ({
      card,
      score: dynamicScore({ card, lifeState, routeStyle }),
    }))
    .sort((a, b) => b.score - a.score || a.card.cardNo - b.card.cardNo)
    .map((item) => item.card);
};
