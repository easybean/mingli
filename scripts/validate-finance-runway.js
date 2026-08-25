#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');
const { samples } = require('../data/samples/astrolabe-samples.json');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const sequenceAt = (value) => Array.from({ length: 7 }, (_item, index) => Math.floor(value / (3 ** (6 - index))) % 3);
const RULES = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06'];
const RULE_IDS = ['F01_cash_floor', 'F02_income_repair', 'F03_bounded_invest', 'F04_external_cash', 'F05_pressure_cost', 'F06_stop_loss'];
const errors = [];

const profileFor = (sample, target) => {
  const query = new URLSearchParams(sample.query);
  query.set('target', target);
  return buildAstrolabe(query).reading.financeStoryProfile;
};

const main = async () => {
  const storyUrl = dataUrl(read('src/content/work-stories/finance-runway.js'));
  const lifeUrl = dataUrl("export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map(key=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));");
  const engineUrl = dataUrl(read('src/domain/work-story/story-engine.js').replace("from '../life-state.js'", `from '${lifeUrl}'`));
  const viewUrl = dataUrl(read('src/domain/work-story/work-story-view-model.js').replace("from './story-engine.js'", `from '${engineUrl}'`));
  const shareUrl = dataUrl(read('src/domain/work-story/share-model.js'));
  const catalogUrl = dataUrl(read('src/domain/work-story/story-catalog.js'));
  const [{ FINANCE_RUNWAY: definition }, engine, view, share, catalog] = await Promise.all([
    import(storyUrl), import(engineUrl), import(viewUrl), import(shareUrl), import(catalogUrl),
  ]);

  const contract = engine.validateStoryDefinition(definition);
  if (contract.length) errors.push(`contract: ${contract.join('；')}`);
  if (definition.version !== '0.6.0' || definition.nodes.length !== 21 || definition.nodes.some((node) => node.choices.length !== 3) || definition.endings.length !== 6) errors.push('finance story must be 0.6.0 with 21/63/6');
  const entry = catalog.WORK_STORY_ENTRIES.find((item) => item.id === 'finance_runway');
  if (entry?.status !== 'available' || entry.storyId !== definition.id || definition.themeId !== 'finance') errors.push('finance catalog/metadata is not available');
  definition.nodes.forEach((node) => {
    if (!(node.match?.anyTags || []).length || node.match.anyTags.some((tag) => !/^astro:fusion:F0[1-6]$/.test(tag)) || JSON.stringify(node).includes('astro:fusion:M') || JSON.stringify(node).includes('astro:fusion:R')) errors.push(`${node.id} must use finance fusions only`);
    if (!node.copy?.transition?.trim() || !node.copy?.situation?.trim() || !node.copy?.conflict?.trim()) errors.push(`${node.id} visible copy is incomplete`);
  });
  const allImmediate = definition.nodes.flatMap((node) => node.choices.map((choice) => choice.immediate));
  if (allImmediate.length !== 63 || new Set(allImmediate).size !== 63) errors.push('all 63 choices need distinct conversational feedback');
  const validTargets = new Set([...definition.nodes.map((node) => node.id), ...definition.endings.map((ending) => ending.id)]);
  definition.nodes.flatMap((node) => node.choices).flatMap((choice) => choice.delayedFlags).forEach((item) => {
    if (!item.consumeBy?.length || item.consumeBy.some((target) => !validTargets.has(target))) errors.push(`bad delayed target ${item.id}`);
  });
  definition.endings.forEach((ending) => {
    if (!ending.summary?.gain || !ending.summary?.cost || !ending.summary?.alternativeHint || !ending.share?.hook || !ending.share?.question) errors.push(`${ending.id} missing useful result/share copy`);
  });

  const actualProfiles = samples.map((sample) => profileFor(sample, '2026-08-25 12:00'));
  actualProfiles.forEach((profile, index) => {
    if (!profile.available || !profile.fusionMatrix || !profile.tags.some((tag) => /^astro:fusion:F/.test(tag))) errors.push(`sample ${index} missing complete finance profile`);
    RULES.forEach((rule, ruleIndex) => {
      const matrix = profile.fusionMatrix?.[rule];
      const tagged = profile.tags.includes(`astro:fusion:${rule}`);
      if (tagged !== Boolean(matrix?.complete)) errors.push(`sample ${index} ${rule} leaked a partial fusion`);
      if (tagged && (!matrix.bazi.hit || !matrix.ziwei.hit || !matrix.period.hit || profile.evidenceByRuleId?.[RULE_IDS[ruleIndex]]?.length !== 3)) errors.push(`sample ${index} ${rule} lacks three-layer evidence`);
    });
    let session = engine.createWorkStorySession({ definition, profile });
    for (let stage = 0; stage < 7; stage += 1) {
      const model = view.createWorkStoryViewModel({ definition, profile, session });
      if (!model.node || model.node.evidence.length !== 3 || model.node.evidence.some((item) => /部分匹配/.test(item.title || ''))) errors.push(`sample ${index} stage ${stage + 1} lacks visible finance evidence`);
      const choice = model.node?.choices?.[0];
      if (!choice) break;
      session = engine.advanceStory({ definition, profile, session: engine.chooseStoryOption({ definition, profile, session, choiceId: choice.id }) });
    }
  });
  if (new Set(actualProfiles.map((profile) => JSON.stringify(profile.initialWorkState))).size < 2) errors.push('finance chips must vary by chart');

  const baseProfile = {
    available: true, tags: RULES.map((rule) => `astro:fusion:${rule}`), initialState: {},
    evidenceByRuleId: Object.fromEntries(RULE_IDS.map((id) => [id, [{ title: '八字底色', body: 'x' }, { title: '紫微结构', body: 'x' }, { title: '当前运限', body: 'x' }]])),
  };
  const profiles = [
    ['runway', 'income', 'invest', 'external', 'pressure', 'reset'],
    ['income', 'external', 'runway', 'invest', 'pressure', 'reset'],
    ['invest', 'pressure', 'runway', 'income', 'external', 'reset'],
  ].map((rankedFocuses) => ({ ...baseProfile, rankedFocuses }));
  const nodesSeen = new Set(); const choicesSeen = new Set(); const endingsSeen = new Set(); const echoesSeen = new Set();
  profiles.forEach((profile) => {
    for (let value = 0; value < 3 ** 7; value += 1) {
      const indexes = sequenceAt(value);
      let session = engine.createWorkStorySession({ definition, profile });
      for (let stage = 0; stage < 7; stage += 1) {
        const node = engine.resolveCurrentNode({ definition, profile, session });
        const choice = node?.choices?.[indexes[stage]];
        if (!node || !choice) { errors.push(`dead path ${value} at stage ${stage + 1}`); break; }
        nodesSeen.add(node.id); choicesSeen.add(choice.id);
        session = engine.advanceStory({ definition, profile, session: engine.chooseStoryOption({ definition, profile, session, choiceId: choice.id }) });
        session.delayedConsequences.forEach((echo) => echoesSeen.add(echo.flagId));
      }
      if (!session.completed) errors.push(`incomplete path ${value}`);
      else {
        const ending = engine.resolveEnding({ definition, profile, session });
        if (!ending) errors.push(`no ending ${value}`); else endingsSeen.add(ending.id);
      }
    }
  });
  if (nodesSeen.size !== 21 || choicesSeen.size !== 63 || endingsSeen.size !== 6) errors.push(`reachability ${nodesSeen.size}/21 nodes, ${choicesSeen.size}/63 choices, ${endingsSeen.size}/6 endings`);
  const produced = new Set(definition.nodes.flatMap((node) => node.choices.flatMap((choice) => choice.delayedFlags.map((item) => item.id))));
  if ([...produced].some((id) => !echoesSeen.has(id))) errors.push('every finance choice must echo later on at least one path');

  const changedByDate = samples.some((sample) => {
    const first = profileFor(sample, '2026-08-25 12:00');
    const later = profileFor(sample, '2027-08-25 12:00');
    const trace = (profile) => {
      let session = engine.createWorkStorySession({ definition, profile });
      const output = [];
      for (let stage = 0; stage < 7; stage += 1) {
        const model = view.createWorkStoryViewModel({ definition, profile, session });
        if ([0, 3, 5].includes(stage)) output.push({ node: model.node?.id, evidence: model.node?.evidence, weights: profile.weights });
        const choice = model.node?.choices?.[0]; if (!choice) break;
        session = engine.advanceStory({ definition, profile, session: engine.chooseStoryOption({ definition, profile, session, choiceId: choice.id }) });
      }
      return output;
    };
    return JSON.stringify(trace(first)) !== JSON.stringify(trace(later));
  });
  if (!changedByDate) errors.push('representative date must change finance weights, node or visible evidence');

  const privateProfile = { ...actualProfiles[0], source: { date: '1995-03-12', birthTime: '07:30', birthPlace: '徐州', pillars: '甲子' } };
  const shareModel = share.createWorkStoryShareModel({ definition, profile: privateProfile, session: { choices: [{ choiceLabel: '先算三个月安全线' }] }, ending: { ...definition.endings[0], title: definition.endings[0].summary.title, summaryText: definition.endings[0].summary.core } });
  const serialized = JSON.stringify(shareModel);
  if (/工作岔路|职业路线|关系岔路|1995-03-12|07:30|徐州|甲子/.test(serialized) || shareModel.shareBrand !== 'MINGLI · 财务岔路') errors.push('finance share leaked another theme or private birth data');
  if (errors.length) { errors.forEach((error) => console.error(`FAIL ${error}`)); process.exit(1); }
  console.log('PASS finance_runway: strict F01–F06 profile, 21/63/6, 6,561 paths, visible evidence, delayed effects and privacy-safe share');
};

main().catch((error) => { console.error(error); process.exit(1); });
