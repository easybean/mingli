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
  const testProfile = { available: true, tags: Array.from({ length: 12 }, (_, index) => `astro:fusion:M${index + 1}`), rankedFocuses: ['safety'], initialState: {}, evidence: {} };
  const first = engine.createWorkStorySession({ definition, profile: testProfile });
  const opening = engine.resolveCurrentNode({ definition, profile: testProfile, session: first });
  const pathA = engine.chooseStoryOption({ definition, profile: testProfile, session: first, choiceId: opening.choices[0].id });
  const pathC = engine.chooseStoryOption({ definition, profile: testProfile, session: first, choiceId: opening.choices[2].id });
  const secondA = engine.resolveCurrentNode({ definition, profile: testProfile, session: engine.advanceStory({ definition, profile: testProfile, session: pathA }) });
  const secondC = engine.resolveCurrentNode({ definition, profile: testProfile, session: engine.advanceStory({ definition, profile: testProfile, session: pathC }) });
  if (!secondA || !secondC || secondA.id === secondC.id) errors.push('different opening choices must change the second act');
  if (!engine.advanceStory({ definition, profile: testProfile, session: pathA }).delayedConsequences.length) errors.push('delayed flags must be consumed at their target node');
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

if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exit(1);
}
console.log('PASS work story: 21 nodes, 63 choices, 6 endings, profile evidence and variance');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
