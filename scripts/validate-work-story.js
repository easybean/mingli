#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');

const contentPath = path.join(__dirname, '../src/content/work-stories/unemployed-month-five.js');
const source = fs.readFileSync(contentPath, 'utf8');
const errors = [];

const count = (pattern) => (source.match(pattern) || []).length;
if (count(/node\('JL\d{2}'/g) !== 21) errors.push('expected 21 formal nodes');
if (count(/choice\('JL\d{2}_C[123]'/g) !== 63) errors.push('expected 63 formal choices');
if (count(/id: 'ending_/g) !== 6) errors.push('expected 6 endings');
const sampleFile = require('../data/samples/astrolabe-samples.json');

const main = async () => {
  const encoded = Buffer.from(source).toString('base64');
  const content = await import(`data:text/javascript;base64,${encoded}`);
  const definition = content.UNEMPLOYED_MONTH_FIVE;
  const catalogPath = path.join(__dirname, '../src/domain/work-story/story-catalog.js');
  const catalogSource = fs.readFileSync(catalogPath, 'utf8');
  const catalog = await import(`data:text/javascript;base64,${Buffer.from(catalogSource).toString('base64')}`);
  const entries = catalog.WORK_STORY_ENTRIES || [];
  const themes = catalog.STORY_THEMES || [];
  const availableEntries = entries.filter((entry) => entry.status === 'available');
  const upcomingEntries = entries.filter((entry) => entry.status === 'upcoming');
  const requiredThemeIds = ['work', 'relationship', 'family', 'finance', 'migration'];
  if (themes.length !== requiredThemeIds.length || themes.some((theme, index) => theme.id !== requiredThemeIds[index])
    || themes.some((theme) => !theme.label || !theme.description || !Array.isArray(theme.entries) || !theme.entries.length)
    || new Set(entries.map((entry) => entry.id)).size !== entries.length) {
    errors.push('catalog must expose five structured, non-overlapping primary themes with secondary entries');
  }
  if (availableEntries.length !== 3 || availableEntries[0]?.id !== 'job_lost' || availableEntries[1]?.id !== 'job_exit' || availableEntries[2]?.id !== 'offer_choice'
    || availableEntries.some((entry) => entry.themeId !== 'work') || upcomingEntries.length !== entries.length - 3
    || entries.some((entry) => entry.status !== 'available' && entry.status !== 'upcoming')) {
    errors.push('only the three shipped work stories may be available; every other catalog entry must remain upcoming');
  }
  const eventsSource = fs.readFileSync(path.join(__dirname, '../src/app/events.js'), 'utf8');
  const homeSource = fs.readFileSync(path.join(__dirname, '../src/pages/home-page.js'), 'utf8');
  const storeSource = fs.readFileSync(path.join(__dirname, '../src/app/store.js'), 'utf8');
  if (!/keydown/.test(eventsSource) || !/ArrowRight/.test(eventsSource) || !/ArrowLeft/.test(eventsSource) || !/Home/.test(eventsSource) || !/End/.test(eventsSource)
    || !/setStoryCatalogTheme\(nextThemeId\)/.test(eventsSource) || !/\.focus\(\)/.test(eventsSource)) {
    errors.push('story theme tabs must support ArrowLeft/ArrowRight/Home/End activation and focus');
  }
  if (!/entry\.status === 'available' \? `data-work-entry/.test(homeSource)
    || !/catalogEntry\.status !== 'available'/.test(storeSource)) {
    errors.push('upcoming catalog entries must be disabled in the page and rejected by the store');
  }
  if (definition.title !== '工作空窗期') errors.push('public definition title must be 工作空窗期');
  if (definition.nodes.some((node) => !node.copy?.transition?.trim())) errors.push('every node must contain a non-empty transition');
  const roleIds = new Set(definition.nodes.flatMap((node) => node.roles || []));
  const characterFor = (roleId) => Array.isArray(definition.characters)
    ? definition.characters.find((item) => item?.id === roleId || item?.roleId === roleId)
    : definition.characters?.[roleId];
  [...roleIds].forEach((roleId) => {
    const character = characterFor(roleId);
    if (!character?.name || (!character?.identity && !character?.title && !character?.role) || (!character?.relationship && !character?.relation) || character?.name === roleId) {
      errors.push(`role ${roleId} must have a non-ID name, identity, and relationship`);
    }
  });
  const zhouInvitation = definition.nodes.find((node) => node.id === 'JL07');
  if (!zhouInvitation || !/前同事/.test(zhouInvitation.copy?.situation || '') || !/邀请你/.test(zhouInvitation.copy?.situation || '') || !/(项目|试点|交付)/.test(zhouInvitation.copy?.situation || '')) {
    errors.push('JL07 must explicitly say that former colleague 周屿 invites the protagonist to join the project');
  }
  const currentGapNodes = definition.nodes.filter((node) => /空窗期/.test(`${node.copy?.title || ''}${node.copy?.situation || ''}${node.copy?.conflict || ''}`)
    && !/此前|过去/.test(`${node.copy?.title || ''}${node.copy?.situation || ''}${node.copy?.conflict || ''}`));
  const limitsToGapStages = (node) => node.match?.careerStages?.length
    && node.match.careerStages.every((stage) => ['unemployed', 'offer_pending'].includes(stage));
  if (currentGapNodes.some((node) => !limitsToGapStages(node))) {
    errors.push('a current unemployment scene must be limited to unemployed or offer_pending career stages');
  }
  const signedOfferChoices = definition.nodes.flatMap((node) => node.choices
    .filter((choice) => choice.delayedFlags.some((flag) => flag.id === 'signed_offer'))
    .map((choice) => `${node.id}/${choice.id}`));
  if (!signedOfferChoices.length || signedOfferChoices.some((id) => !/^JL0[45]\//.test(id))) {
    errors.push('signed_offer flags must only come from explicit pre-signing contract choices');
  }
  const delayed = definition.nodes.flatMap((node) => node.choices.flatMap((choice) => choice.delayedFlags));
  if (!delayed.length || delayed.some((item) => !item.id || !Array.isArray(item.consumeBy) || !item.consumeBy.length)) errors.push('every delayed flag must carry consumeBy');
  const consumed = new Set(delayed.flatMap((item) => item.consumeBy));
  const knownTargets = new Set([...definition.nodes.map((item) => item.id), ...definition.endings.map((item) => item.id)]);
  if ([...consumed].some((id) => !knownTargets.has(id))) errors.push('delayed flag has an unknown consumeBy target');
  // 用 data URL 让 CommonJS 验证脚本执行浏览器 ESM 领域引擎，不需要把服务端改成 ESM。
  const lifeSource = "export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map((key)=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));";
  const lifeUrl = `data:text/javascript;base64,${Buffer.from(lifeSource).toString('base64')}`;
  const enginePath = path.join(__dirname, '../src/domain/work-story/story-engine.js');
  const engineSource = fs.readFileSync(enginePath, 'utf8').replace("from '../life-state.js'", `from '${lifeUrl}'`);
  const engineUrl = `data:text/javascript;base64,${Buffer.from(engineSource).toString('base64')}`;
  const engine = await import(engineUrl);
  const contractErrors = engine.validateStoryDefinition(definition);
  if (contractErrors.length) errors.push(...contractErrors.map((error) => `definition contract: ${error}`));
  const testProfile = { available: true, tags: Array.from({ length: 12 }, (_, index) => `astro:fusion:M${index + 1}`), rankedFocuses: ['safety'], initialState: {}, evidence: {} };
  const first = engine.createWorkStorySession({ definition, profile: testProfile });
  const opening = engine.resolveCurrentNode({ definition, profile: testProfile, session: first });
  const pathA = engine.chooseStoryOption({ definition, profile: testProfile, session: first, choiceId: opening.choices[0].id });
  const pathC = engine.chooseStoryOption({ definition, profile: testProfile, session: first, choiceId: opening.choices[2].id });
  const advancedPathA = engine.advanceStory({ definition, profile: testProfile, session: pathA });
  const secondA = engine.resolveCurrentNode({ definition, profile: testProfile, session: advancedPathA });
  const secondC = engine.resolveCurrentNode({ definition, profile: testProfile, session: engine.advanceStory({ definition, profile: testProfile, session: pathC }) });
  if (!secondA || !secondC || secondA.id === secondC.id) errors.push('different opening choices must change the second act');
  if (!advancedPathA.delayedConsequences.length) errors.push('delayed flags must be consumed at their target node');
  if (advancedPathA.delayedConsequences.length !== 1 || new Set(advancedPathA.delayedConsequences.map((item) => item.key)).size !== advancedPathA.delayedConsequences.length) {
    errors.push('a choice with multiple delayed flags targeting one node must create one delayed echo');
  }
  const signedProfile = {
    available: true, tags: ['astro:fusion:M01', 'astro:fusion:M02', 'astro:fusion:M04', 'astro:fusion:M10'],
    rankedFocuses: ['safety'], initialState: {}, evidence: {},
  };
  let signedSession = engine.createWorkStorySession({ definition, profile: signedProfile });
  const signedOpening = engine.resolveCurrentNode({ definition, profile: signedProfile, session: signedSession });
  if (signedOpening?.id !== 'JL01') errors.push('signed-path profile must start at JL01');
  signedSession = engine.advanceStory({
    definition, profile: signedProfile,
    session: engine.chooseStoryOption({ definition, profile: signedProfile, session: signedSession, choiceId: 'JL01_C1' }),
  });
  const contractNode = engine.resolveCurrentNode({ definition, profile: signedProfile, session: signedSession });
  if (contractNode?.id !== 'JL04' || /试用期考核只有一句话/.test(contractNode?.title || '')) errors.push('JL04 must remain a pre-signing contract decision');
  signedSession = engine.advanceStory({
    definition, profile: signedProfile,
    session: engine.chooseStoryOption({ definition, profile: signedProfile, session: signedSession, choiceId: 'JL04_C1' }),
  });
  const signedThirdAct = engine.resolveCurrentNode({ definition, profile: signedProfile, session: signedSession });
  if (engine.careerStageFor(signedSession) !== 'preboarding' || !signedThirdAct) errors.push('signing a contract must move the session to preboarding');
  signedSession = engine.advanceStory({
    definition, profile: signedProfile,
    session: engine.chooseStoryOption({ definition, profile: signedProfile, session: signedSession, choiceId: 'JL07_C1' }),
  });
  const afterSignedProject = engine.resolveCurrentNode({ definition, profile: signedProfile, session: signedSession });
  if (afterSignedProject?.id === 'JL10' || /(?<!此前)空窗期/.test(afterSignedProject?.scene || '')) {
    errors.push('preboarding path must not render a current unemployment scene after accepting the contract');
  }
  const offerProjectProfile = {
    available: true,
    tags: ['astro:fusion:M03', 'astro:fusion:M04', 'astro:fusion:M09', 'astro:fusion:M10'],
    rankedFocuses: ['safety'], initialState: {}, evidence: {},
  };
  const stepToProjectChoice = (storyDefinition, jl05ChoiceId) => {
    let session = engine.createWorkStorySession({ definition: storyDefinition, profile: offerProjectProfile });
    const openingNode = engine.resolveCurrentNode({ definition: storyDefinition, profile: offerProjectProfile, session });
    if (openingNode?.id !== 'JL02') errors.push('offer/project test profile must start at JL02');
    session = engine.advanceStory({
      definition: storyDefinition, profile: offerProjectProfile,
      session: engine.chooseStoryOption({ definition: storyDefinition, profile: offerProjectProfile, session, choiceId: 'JL02_C1' }),
    });
    const termsNode = engine.resolveCurrentNode({ definition: storyDefinition, profile: offerProjectProfile, session });
    if (termsNode?.id !== 'JL05') errors.push('JL02_C1 must lead the offer/project test profile to JL05');
    session = engine.advanceStory({
      definition: storyDefinition, profile: offerProjectProfile,
      session: engine.chooseStoryOption({ definition: storyDefinition, profile: offerProjectProfile, session, choiceId: jl05ChoiceId }),
    });
    return { session, node: engine.resolveCurrentNode({ definition: storyDefinition, profile: offerProjectProfile, session }) };
  };
  const exclusiveRoute = stepToProjectChoice(definition, 'JL05_C1');
  if (!exclusiveRoute.session.flags?.exclusive_6m || exclusiveRoute.node?.id === 'JL07') {
    errors.push('exclusive_6m must exclude JL07 even when stage selection uses fallback ranking');
  }
  const reportableRoute = stepToProjectChoice(definition, 'JL05_C2');
  if (!reportableRoute.session.flags?.sidework_reportable || reportableRoute.session.flags?.exclusive_6m || reportableRoute.node?.id !== 'JL07') {
    errors.push('reportable non-compete side work must remain eligible for JL07');
  }
  const factGateDefinition = JSON.parse(JSON.stringify(definition));
  const factGateNode = factGateDefinition.nodes.find((node) => node.id === 'JL07');
  factGateNode.match.excludeTags = [];
  factGateNode.match.requiresAllFlags = ['flag:signed_offer'];
  factGateNode.match.requiresAnyFlags = ['sidework_reportable'];
  const factBlockedRoute = stepToProjectChoice(factGateDefinition, 'JL05_C1');
  const factAllowedRoute = stepToProjectChoice(factGateDefinition, 'JL05_C2');
  if (factBlockedRoute.node?.id === 'JL07' || factAllowedRoute.node?.id !== 'JL07') {
    errors.push('requiresAllFlags/requiresAnyFlags must be hard eligibility gates before both ranking and fallback');
  }
  const groupedFactGateDefinition = JSON.parse(JSON.stringify(definition));
  const groupedFactGateNode = groupedFactGateDefinition.nodes.find((node) => node.id === 'JL07');
  groupedFactGateNode.match.excludeTags = [];
  groupedFactGateNode.match.requiresFlagGroups = [
    ['signed_offer', 'offer_alive'],
    ['sidework_reportable', 'pilot_lead'],
  ];
  const groupBlockedRoute = stepToProjectChoice(groupedFactGateDefinition, 'JL05_C1');
  const groupAllowedRoute = stepToProjectChoice(groupedFactGateDefinition, 'JL05_C2');
  if (groupBlockedRoute.node?.id === 'JL07' || groupAllowedRoute.node?.id !== 'JL07') {
    errors.push('requiresFlagGroups must require one fact from every group before both ranking and fallback');
  }
  const play = (choiceIndexes) => {
    let session = engine.createWorkStorySession({ definition, profile: testProfile });
    const nodes = [];
    for (let index = 0; index < 7; index += 1) {
      const current = engine.resolveCurrentNode({ definition, profile: testProfile, session });
      nodes.push(current.id);
      session = engine.chooseStoryOption({ definition, profile: testProfile, session, choiceId: current.choices[choiceIndexes[index] || 0].id });
      session = engine.advanceStory({ definition, profile: testProfile, session });
    }
    return { nodes, ending: engine.resolveEnding({ definition, profile: testProfile, session })?.id };
  };
  const routes = [play([0, 0, 0, 0, 0, 0, 0]), play([1, 1, 1, 1, 1, 1, 1]), play([2, 2, 2, 2, 2, 2, 2])];
  if (new Set(routes.map((route) => `${route.nodes[3]}:${route.nodes[5]}:${route.ending}`)).size < 2) errors.push('three choice sequences must diverge by act four, six, or ending');
  let fullPath = first;
  for (let index = 0; index < 7; index += 1) {
    const current = engine.resolveCurrentNode({ definition, profile: testProfile, session: fullPath });
    fullPath = engine.chooseStoryOption({ definition, profile: testProfile, session: fullPath, choiceId: current.choices[0].id });
    fullPath = engine.advanceStory({ definition, profile: testProfile, session: fullPath });
  }
  if (!fullPath.completed || !engine.resolveEnding({ definition, profile: testProfile, session: fullPath })) errors.push('seven-act path must reach an ending');
const profiles = sampleFile.samples.map((sample) => {
  const input = new URLSearchParams(sample.query);
  input.set('target', '2026-08-14 12:00');
  return buildAstrolabe(input).reading.workStoryProfile;
});
if (profiles.some((profile) => !profile.available || !profile.evidence?.bazi?.length || !profile.evidence?.ziwei?.length || !profile.evidence?.transit?.length)) {
  errors.push('all fixed samples require bazi + ziwei + period evidence');
}
if (new Set(profiles.map((profile) => profile.tags.filter((tag) => tag.startsWith('astro:fusion:')).join(','))).size < 2) {
  errors.push('profile fusion tags are too concentrated across sample charts');
}
if (new Set(profiles.map((profile) => `${profile.initialState.resources}:${profile.initialState.opportunity}:${profile.initialState.pressure}`)).size < 2) {
  errors.push('six fixed charts must produce different opening work chips');
}
const dateProfile = (target) => {
  const input = new URLSearchParams(sampleFile.samples[0].query);
  input.set('target', target);
  return buildAstrolabe(input).reading.workStoryProfile;
};
const datedProfiles = ['2026-08-14 12:00', '2027-02-14 12:00', '2028-05-14 12:00'].map(dateProfile);
if (new Set(datedProfiles.map((profile) => `${JSON.stringify(profile.weights)}:${profile.rankedFocuses.join(',')}:${profile.tags.filter((tag) => tag.startsWith('astro:fusion:')).join(',')}`)).size < 2) {
  errors.push('period profile weights, focus, or fusion must change across representative dates');
}
  const female1995Index = sampleFile.samples.findIndex((sample) => sample.id === 'female-1995-guangzhou');
  const female1995 = profiles[female1995Index];
  const femaleSession = engine.createWorkStorySession({ definition, profile: female1995 });
  const femaleOpening = engine.resolveCurrentNode({ definition, profile: female1995, session: femaleSession });
  const viewModelPath = path.join(__dirname, '../src/domain/work-story/work-story-view-model.js');
  const viewModelSource = fs.readFileSync(viewModelPath, 'utf8').replace("from './story-engine.js'", `from '${engineUrl}'`);
  const viewModel = await import(`data:text/javascript;base64,${Buffer.from(viewModelSource).toString('base64')}`);
  const femaleModel = viewModel.createWorkStoryViewModel({ definition, profile: female1995, session: femaleSession });
  if (femaleOpening?.id !== 'JL03' || femaleModel.node?.id !== 'JL03' || femaleModel.node.evidence?.length < 3 || femaleModel.node.evidence?.some((item) => item.title === '命理依据（部分匹配）')) {
    errors.push('female-1995 JL03 must render matched three-layer evidence instead of partial fallback');
  }
  if (!femaleModel.node?.transition || femaleModel.node.characters?.some((character) => !character.name || !character.identity || !character.relationship || character.name === character.id)) {
    errors.push('story view model must expose named characters with identity and relationship plus a transition');
  }
  const legacyDuplicateSession = {
    ...femaleSession,
    delayedConsequences: [
      { targetId: femaleOpening.id, sourceChoice: '旧版选择', text: '旧版会话里重复保存的回响。' },
      { targetId: femaleOpening.id, sourceChoice: '旧版选择', text: '旧版会话里重复保存的回响。' },
    ],
  };
  const legacyDuplicateModel = viewModel.createWorkStoryViewModel({ definition, profile: female1995, session: legacyDuplicateSession });
  if (legacyDuplicateModel.delayedEchoes.length !== 1) {
    errors.push('legacy saved sessions with duplicate delayed echoes must render one echo');
  }
  const signedModel = viewModel.createWorkStoryViewModel({ definition, profile: signedProfile, session: signedSession });
  if (signedModel.careerStage !== 'preboarding' || signedModel.displayTitle === '工作空窗期') {
    errors.push('signed path must use a preboarding display title instead of 工作空窗期');
  }

if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exit(1);
}
console.log('PASS work story: job_lost remains valid with 21 nodes, 63 choices, 6 endings, profile evidence and variance');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
