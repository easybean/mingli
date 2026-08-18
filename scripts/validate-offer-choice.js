#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');
const samples = require('../data/samples/astrolabe-samples.json').samples;
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const errors = [];

const main = async () => {
  const offerUrl = dataUrl(read('src/content/work-stories/offer-choice.js'));
  const lifeUrl = dataUrl("export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map((key)=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));");
  const engineUrl = dataUrl(read('src/domain/work-story/story-engine.js').replace("from '../life-state.js'", `from '${lifeUrl}'`));
  const shareUrl = dataUrl(read('src/domain/work-story/share-model.js'));
  const viewUrl = dataUrl(read('src/domain/work-story/work-story-view-model.js').replace("from './story-engine.js'", `from '${engineUrl}'`));
  const [{ OFFER_CHOICE: definition }, engine, share, view] = await Promise.all([import(offerUrl), import(engineUrl), import(shareUrl), import(viewUrl)]);
  const contract = engine.validateStoryDefinition(definition);
  if (contract.length) errors.push(`contract: ${contract.join('；')}`);
  if (definition.id !== 'offer_choice' || definition.entry !== 'offer_choice' || definition.nodes.length !== 21 || definition.stages.length !== 7 || definition.endings.length !== 6 || definition.nodes.some((node) => node.choices?.length !== 3 || !node.copy?.transition?.trim())) errors.push('offer definition must contain 7 stages, 21 transitioned nodes, 3 choices each, and 6 endings');
  if (definition.careerStageTitles?.offer_pending !== '两个 Offer，等待决定' || !definition.careerStageTitles?.preboarding) errors.push('offer story must expose accurate pending and preboarding stage titles');
  if (!definition.initialFlags?.two_written_offers || definition.nodes.some((node) => (node.choices || []).flatMap((choice) => choice.delayedFlags || []).some((flag) => flag.id === 'two_written_offers'))) errors.push('two_written_offers must be an opening fact, never created by a choice or profile');
  const targetIds = new Set([...definition.nodes.map((node) => node.id), ...definition.endings.map((ending) => ending.id)]);
  if (definition.nodes.flatMap((node) => node.choices).flatMap((choice) => choice.delayedFlags).some((flag) => !flag.consumeBy?.length || flag.consumeBy.some((target) => !targetIds.has(target)))) errors.push('all delayed flags need known consume targets');
  const profile = { available: true, tags: Array.from({ length: 12 }, (_, index) => `astro:fusion:M${String(index + 1).padStart(2, '0')}`), rankedFocuses: ['opportunity'], initialState: {} };
  const sequenceAt = (value) => Array.from({ length: 7 }, (_item, index) => Math.floor(value / (3 ** (6 - index))) % 3);
  const endings = new Set(); const producedFlags = new Set(); const echoedFlags = new Set();
  const nodesSeen = new Set(); const choicesSeen = new Set();
  const runPaths = (activeProfile, label) => {
    for (let value = 0; value < 3 ** 7; value += 1) {
      let session = engine.createWorkStorySession({ definition, profile: activeProfile });
    const indexes = sequenceAt(value);
    for (let stage = 0; stage < 7; stage += 1) {
      const node = engine.resolveCurrentNode({ definition, profile: activeProfile, session });
      const choice = node?.choices?.[indexes[stage]];
      if (!node || !choice) { errors.push(`${label} path ${value} cannot resolve stage ${stage + 1}`); break; }
      nodesSeen.add(node.id); choicesSeen.add(choice.id);
      choice.delayedFlags.forEach((flag) => producedFlags.add(flag.id));
      try { session = engine.advanceStory({ definition, profile: activeProfile, session: engine.chooseStoryOption({ definition, profile: activeProfile, session, choiceId: choice.id }) }); } catch (error) { errors.push(`${label} path ${value} stage ${stage + 1}: ${error.message}`); break; }
      (session.delayedConsequences || []).forEach((item) => echoedFlags.add(item.flagId));
    }
      if (!session.completed) errors.push(`${label} path ${value} did not complete`);
      const ending = session.completed && engine.resolveEnding({ definition, profile: activeProfile, session });
      if (!ending) errors.push(`${label} path ${value} has no ending`); else endings.add(ending.id);
    }
  };
  runPaths(profile, 'fusion-all');

  const fixedProfiles = samples.map((sample) => { const query = new URLSearchParams(sample.query); query.set('target', '2026-08-14 12:00'); return buildAstrolabe(query).reading.workStoryProfile; });
  fixedProfiles.forEach((fixedProfile, index) => runPaths(fixedProfile, `fixed-${index + 1}`));
  const deadNodes = definition.nodes.map((node) => node.id).filter((id) => !nodesSeen.has(id));
  const deadChoices = definition.nodes.flatMap((node) => node.choices.map((choice) => choice.id)).filter((id) => !choicesSeen.has(id));
  const deadEndings = definition.endings.map((ending) => ending.id).filter((id) => !endings.has(id));
  if (deadNodes.length || deadChoices.length || deadEndings.length) errors.push(`coverage dead nodes=${deadNodes.join(',') || '0'} choices=${deadChoices.join(',') || '0'} endings=${deadEndings.join(',') || '0'}`);
  if (nodesSeen.size !== 21 || choicesSeen.size !== 63 || endings.size !== 6) errors.push(`coverage must reach 21 nodes / 63 choices / 6 endings; got ${nodesSeen.size}/${choicesSeen.size}/${endings.size}`);
  [...producedFlags].filter((flag) => !echoedFlags.has(flag)).forEach((flag) => errors.push(`flag ${flag} never produces an actual delayed echo`));
  const starts = fixedProfiles.map((fixedProfile) => engine.resolveCurrentNode({ definition, profile: fixedProfile, session: engine.createWorkStorySession({ definition, profile: fixedProfile }) }));
  if (starts.some((node) => !node || node.evidenceSlots?.[0]?.requiredLayers?.length !== 3) || new Set(starts.map((node) => node.id)).size < 2) errors.push('six fixed charts must have valid three-layer evidence and at least two different offer openings');
  const trace = (target) => {
    const query = new URLSearchParams(samples[0].query); query.set('target', target);
    const fixedProfile = buildAstrolabe(query).reading.workStoryProfile; let session = engine.createWorkStorySession({ definition, profile: fixedProfile }); const result = [];
    for (let stage = 0; stage < 6; stage += 1) {
      const node = engine.resolveCurrentNode({ definition, profile: fixedProfile, session }); if (!node) break;
      if ([0, 3, 5].includes(stage)) {
        const visible = view.createWorkStoryViewModel({ definition, profile: fixedProfile, session }).node?.evidence || [];
        result.push(`${node.id}:${visible.map((item) => `${item.title}:${item.body}`).join('|')}`);
      }
      session = engine.advanceStory({ definition, profile: fixedProfile, session: engine.chooseStoryOption({ definition, profile: fixedProfile, session, choiceId: node.choices[0].id }) });
    }
    return result.join('|');
  };
  if (!trace('2026-08-14 12:00') || trace('2026-08-14 12:00') === trace('2028-05-14 12:00')) errors.push('representative date must change a node/evidence/weight at act 1, 4, or 6');
  const privateModel = share.createWorkStoryShareModel({ definition, profile: { ...profile, source: { date: '1995-03-12', birthTime: '07:30', birthPlace: '徐州', pillars: '甲子' } }, session: engine.createWorkStorySession({ definition, profile }), ending: { ...definition.endings[0], title: 'x', summaryText: 'x' } });
  if (['1995-03-12', '07:30', '徐州', '甲子'].some((secret) => JSON.stringify(privateModel).includes(secret))) errors.push('share model leaks private source data');
  if (errors.length) { errors.forEach((error) => console.error(`FAIL ${error}`)); process.exit(1); }
  console.log('PASS offer_choice: contract, 15,309 paths, full reachability, facts, echoes, chart/date variation and share privacy');
};
main().catch((error) => { console.error(error); process.exit(1); });
