#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');
const { samples } = require('../data/samples/astrolabe-samples.json');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const sequenceAt = (value) => Array.from({ length: 7 }, (_item, index) => Math.floor(value / (3 ** (6 - index))) % 3);
const RULES = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06'];
const RULE_SUFFIX = { R01: 'clarity_first', R02: 'emotional_wait', R03: 'peer_grounding', R04: 'time_boundary', R05: 'over_give_risk', R06: 'slow_but_real' };
const RULE_IDS = RULES.map((id) => `${id}_${RULE_SUFFIX[id]}`);
const errors = [];

const relationshipProfileFor = (sample, target) => {
  const query = new URLSearchParams(sample.query);
  query.set('target', target);
  return buildAstrolabe(query).reading.relationshipStoryProfile;
};

const main = async () => {
  const storyUrl = dataUrl(read('src/content/work-stories/relationship-unclear.js'));
  const lifeUrl = dataUrl("export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map(key=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));");
  const engineUrl = dataUrl(read('src/domain/work-story/story-engine.js').replace("from '../life-state.js'", `from '${lifeUrl}'`));
  const viewUrl = dataUrl(read('src/domain/work-story/work-story-view-model.js').replace("from './story-engine.js'", `from '${engineUrl}'`));
  const shareUrl = dataUrl(read('src/domain/work-story/share-model.js'));
  const catalogUrl = dataUrl(read('src/domain/work-story/story-catalog.js'));
  const [{ RELATIONSHIP_UNCLEAR: definition }, engine, view, share, catalog] = await Promise.all([
    import(storyUrl), import(engineUrl), import(viewUrl), import(shareUrl), import(catalogUrl),
  ]);

  const contract = engine.validateStoryDefinition(definition);
  if (contract.length) errors.push(`contract: ${contract.join('；')}`);
  if (definition.version !== '0.5.0' || definition.nodes.length !== 21 || definition.stages.length !== 7 || definition.endings.length !== 6) errors.push('0.5.0 21/63/6 contract');
  const entry = catalog.WORK_STORY_ENTRIES.find((item) => item.id === 'relationship_unclear');
  if (entry?.status !== 'available' || entry.storyId !== definition.id) errors.push('relationship catalog entry is not available');
  definition.nodes.forEach((node) => {
    const tags = node.match?.anyTags || [];
    if (!tags.length || tags.some((tag) => !/^astro:fusion:R0[1-6]$/.test(tag)) || JSON.stringify(node).includes('astro:fusion:M')) errors.push(`${node.id} must use R01–R06 fusions only`);
    if ((node.match?.allTags || []).some((tag) => tag.startsWith('entry:'))) errors.push(`${node.id} has an entry allTags fallback trap`);
  });
  const laterImmediate = definition.nodes.filter((node) => /^RU1[3-8]$/.test(node.id)).flatMap((node) => node.choices.map((choice) => choice.immediate));
  if (laterImmediate.length !== 18 || new Set(laterImmediate).size !== 18 || laterImmediate.some((text) => /接下来要看这件事会把关系带到哪里/.test(text))) errors.push('RU13–RU18 need distinct, conversational immediate feedback instead of a shared template');
  const landingImmediate = definition.nodes.filter((node) => /^RU(19|20|21)$/.test(node.id)).flatMap((node) => node.choices.map((choice) => choice.immediate));
  if (landingImmediate.length !== 9 || new Set(landingImmediate).size !== 9 || landingImmediate.some((text) => /你选了[“「].+[”」].*下一段时间先按这个约定/.test(text))) errors.push('RU19–RU21 need nine distinct, conversational landing responses');
  const targetIds = new Set([...definition.nodes.map((node) => node.id), ...definition.endings.map((ending) => ending.id)]);
  definition.nodes.flatMap((node) => node.choices).flatMap((choice) => choice.delayedFlags).forEach((item) => {
    if (!item.consumeBy?.length || item.consumeBy.some((target) => !targetIds.has(target))) errors.push(`bad delayed target ${item.id}`);
  });

  const actualProfiles = samples.map((sample) => relationshipProfileFor(sample, '2026-08-14 12:00'));
  actualProfiles.forEach((profile, index) => {
    if (!profile.available || !profile.fusionMatrix) errors.push(`sample ${index} missing relationship profile`);
    RULES.forEach((rule) => {
      const matrix = profile.fusionMatrix?.[rule];
      const tagged = profile.tags.includes(`astro:fusion:${rule}`);
      if (tagged !== Boolean(matrix?.complete)) errors.push(`sample ${index} ${rule} partial layer leaked as fusion`);
      if (tagged && (!matrix.bazi.hit || !matrix.ziwei.hit || !matrix.period.hit || (profile.evidenceByRuleId?.[`${rule}_${RULE_SUFFIX[rule]}`] || []).length !== 3)) errors.push(`sample ${index} ${rule} lacks a real three-layer evidence chain`);
    });
    if (profile.tags.some((tag) => tag.startsWith('astro:fusion:R'))) {
      let session = engine.createWorkStorySession({ definition, profile });
      for (let stage = 0; stage < 7; stage += 1) {
        const model = view.createWorkStoryViewModel({ definition, profile, session });
        if (stage === 0 && !(model.node?.match?.preferredTags || []).some((tag) => profile.tags.includes(tag))) errors.push(`sample ${index} opening was not ranked from its own complete relationship fusion`);
        if (model.node?.evidence?.length !== 3 || model.node.evidence.some((item) => /部分匹配/.test(item.title || ''))) errors.push(`sample ${index} stage ${stage + 1} did not show one complete three-layer relationship chain`);
        const selected = model.node?.choices?.[0];
        if (!selected) break;
        session = engine.advanceStory({ definition, profile, session: engine.chooseStoryOption({ definition, profile, session, choiceId: selected.id }) });
      }
    }
  });
  if (!actualProfiles.some((profile) => profile.tags.some((tag) => tag.startsWith('astro:fusion:R')))) errors.push('sample charts produced no complete relationship fusion');

  // Exercise every fact-continuous choice path with a complete matrix. If a
  // node is only selected by chooseCandidate's fallback, this check fails.
  const completeProfile = {
    available: true,
    tags: RULES.map((rule) => `astro:fusion:${rule}`),
    rankedFocuses: ['clarity', 'waiting', 'peer', 'time', 'boundary', 'slow'],
    initialState: {},
    evidenceByRuleId: Object.fromEntries(RULE_IDS.map((id) => [id, [{ title: '八字底色', body: 'x' }, { title: '紫微结构', body: 'x' }, { title: '当前运限', body: 'x' }]])),
  };
  const completeProfiles = [
    ['clarity', 'waiting', 'peer', 'time', 'boundary', 'slow'],
    ['waiting', 'boundary', 'clarity', 'peer', 'time', 'slow'],
    ['time', 'slow', 'peer', 'boundary', 'clarity', 'waiting'],
    ['boundary', 'waiting', 'clarity', 'peer', 'time', 'slow'],
    ['slow', 'time', 'clarity', 'waiting', 'peer', 'boundary'],
    ['peer', 'clarity', 'waiting', 'time', 'boundary', 'slow'],
  ].map((rankedFocuses) => ({ ...completeProfile, rankedFocuses }));
  const nodesSeen = new Set(); const choicesSeen = new Set(); const endingsSeen = new Set(); const echoesSeen = new Set();
  completeProfiles.forEach((profile) => { for (let value = 0; value < 3 ** 7; value += 1) {
    let session = engine.createWorkStorySession({ definition, profile });
    for (let stage = 0; stage < 7; stage += 1) {
      const node = engine.resolveCurrentNode({ definition, profile, session });
      const choice = node?.choices?.[sequenceAt(value)[stage]];
      const activeTags = new Set([...profile.tags, `entry:${session.entry}`, ...Object.keys(session.flags || {}).map((flag) => `flag:${flag}`)]);
      if (!node || !choice || !(node.match.anyTags || []).some((tag) => activeTags.has(tag))) { errors.push(`dead/fallback path ${value} stage ${stage + 1}`); break; }
      nodesSeen.add(node.id); choicesSeen.add(choice.id);
      session = engine.advanceStory({ definition, profile, session: engine.chooseStoryOption({ definition, profile, session, choiceId: choice.id }) });
      session.delayedConsequences.forEach((echo) => echoesSeen.add(echo.flagId));
    }
    if (!session.completed) errors.push(`incomplete path ${value}`);
    else {
      const ending = engine.resolveEnding({ definition, profile, session });
      if (!ending) errors.push(`no ending ${value}`); else endingsSeen.add(ending.id);
    }
  } });
  if (nodesSeen.size !== 21 || choicesSeen.size !== 63 || endingsSeen.size !== 6) {
    const deadNodes = definition.nodes.map((node) => node.id).filter((id) => !nodesSeen.has(id));
    const deadChoices = definition.nodes.flatMap((node) => node.choices.map((choice) => choice.id)).filter((id) => !choicesSeen.has(id));
    errors.push(`reachability ${nodesSeen.size}/${choicesSeen.size}/${endingsSeen.size}; dead=${deadNodes.join(',')}; choices=${deadChoices.join(',')}`);
  }
  const producedFlagIds = new Set(definition.nodes.flatMap((node) => node.choices.flatMap((choice) => choice.delayedFlags.map((flag) => flag.id))));
  if ([...producedFlagIds].some((id) => !echoesSeen.has(id))) errors.push('every relationship choice fact must return as a delayed echo on at least one complete path');

  // Cross-date coverage compares real profile output and the evidence actually
  // shown in the ViewModel; static labels are not sufficient.
  const differences = samples.map((sample) => {
    const first = relationshipProfileFor(sample, '2026-08-14 12:00');
    const later = relationshipProfileFor(sample, '2027-08-14 12:00');
    if (!first.available || !later.available) return false;
    const opening = (profile) => engine.resolveCurrentNode({ definition, profile, session: engine.createWorkStorySession({ definition, profile }) })?.id;
    const visibleEvidence = (profile) => view.createWorkStoryViewModel({ definition, profile, session: engine.createWorkStorySession({ definition, profile }) }).node?.evidence || [];
    return JSON.stringify({ weights: first.weights, ranks: first.rankedFocuses, tags: first.tags, opening: opening(first), evidence: visibleEvidence(first) }) !== JSON.stringify({ weights: later.weights, ranks: later.rankedFocuses, tags: later.tags, opening: opening(later), evidence: visibleEvidence(later) });
  });
  if (!differences.some(Boolean)) errors.push('cross-date relationship output did not change weights/rank/candidate/visible evidence');

  const sampleProfile = actualProfiles.find((profile) => profile.tags.some((tag) => tag.startsWith('astro:fusion:R'))) || completeProfile;
  const model = view.createWorkStoryViewModel({ definition, profile: sampleProfile, session: engine.createWorkStorySession({ definition, profile: sampleProfile }) });
  const firstEnding = { ...definition.endings[0], title: definition.endings[0].summary.title, summaryText: definition.endings[0].summary.core };
  const shareModel = share.createWorkStoryShareModel({ definition, profile: { ...sampleProfile, source: { date: '1995-03-12', birthPlace: '徐州' } }, session: engine.createWorkStorySession({ definition, profile: sampleProfile }), ending: firstEnding });
  let completeSession = engine.createWorkStorySession({ definition, profile: completeProfile });
  for (let stage = 0; stage < 7; stage += 1) {
    const node = engine.resolveCurrentNode({ definition, profile: completeProfile, session: completeSession });
    completeSession = engine.advanceStory({ definition, profile: completeProfile, session: engine.chooseStoryOption({ definition, profile: completeProfile, session: completeSession, choiceId: node.choices[0].id }) });
  }
  const resultModel = view.createWorkStoryViewModel({ definition, profile: completeProfile, session: completeSession });
  const homeSource = read('src/pages/home-page.js');
  if (!/威胁、控制、暴力、被跟踪/.test(homeSource)) errors.push('relationship entry needs its restrained real-world safety notice');
  if (/工作|职业|1995-03-12|徐州/.test(JSON.stringify(model)) || /工作|职业|1995-03-12|徐州/.test(JSON.stringify(resultModel)) || /工作|职业|1995-03-12|徐州/.test(JSON.stringify(shareModel))) errors.push('relationship view/share contains work copy or private source');
  if (errors.length) { errors.forEach((error) => console.error(`FAIL ${error}`)); process.exit(1); }
  console.log('PASS relationship_unclear: strict R01–R06 three-layer profile, 21/63/6, 2187 fact-continuous paths, cross-date output and privacy-safe relationship UI');
};

main().catch((error) => { console.error(error); process.exit(1); });
