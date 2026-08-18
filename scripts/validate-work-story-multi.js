#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildAstrolabe } = require('../server');
const sampleFile = require('../data/samples/astrolabe-samples.json');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const errors = [];

const main = async () => {
  const oldUrl = dataUrl(read('src/content/work-stories/unemployed-month-five.js'));
  const employedUrl = dataUrl(read('src/content/work-stories/employed-want-leave.js'));
  const offerUrl = dataUrl(read('src/content/work-stories/offer-choice.js'));
  const lifeUrl = dataUrl("export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map((key)=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));");
  const engineUrl = dataUrl(read('src/domain/work-story/story-engine.js').replace("from '../life-state.js'", `from '${lifeUrl}'`));
  const registryUrl = dataUrl(read('src/domain/work-story/story-registry.js')
    .replace("from '../../content/work-stories/unemployed-month-five.js'", `from '${oldUrl}'`)
    .replace("from '../../content/work-stories/employed-want-leave.js'", `from '${employedUrl}'`)
    .replace("from '../../content/work-stories/offer-choice.js'", `from '${offerUrl}'`));
  const shareModelUrl = dataUrl(read('src/domain/work-story/share-model.js'));
  const shareCardUrl = dataUrl(read('src/components/work-story-share-card.js')
    .replace("from '../domain/work-story/share-model.js'", `from '${shareModelUrl}'`));
  const [oldContent, employedContent, offerContent, engine, registry, shareModel, shareCard] = await Promise.all([
    import(oldUrl), import(employedUrl), import(offerUrl), import(engineUrl), import(registryUrl), import(shareModelUrl), import(shareCardUrl),
  ]);
  const oldDefinition = oldContent.UNEMPLOYED_MONTH_FIVE;
  const employedDefinition = employedContent.EMPLOYED_WANT_LEAVE;
  const offerDefinition = offerContent.OFFER_CHOICE;
  [oldDefinition, employedDefinition, offerDefinition].forEach((definition) => {
    const contractErrors = engine.validateStoryDefinition(definition);
    if (contractErrors.length) errors.push(`${definition?.id || 'unknown'} contract: ${contractErrors.join('；')}`);
  });
  if (registry.getWorkStoryDefinitionForEntry('job_lost')?.id !== oldDefinition.id
    || registry.getWorkStoryDefinitionForEntry('job_exit')?.id !== employedDefinition.id
    || registry.getWorkStoryDefinitionForEntry('offer_choice')?.id !== offerDefinition.id) {
    errors.push('each available catalog entry must resolve its own definition');
  }
  const profile = {
    available: true,
    tags: Array.from({ length: 12 }, (_, index) => `astro:fusion:M${String(index + 1).padStart(2, '0')}`),
    rankedFocuses: ['opportunity'],
    initialState: {},
  };
  const oldSession = engine.createWorkStorySession({ definition: oldDefinition, profile });
  const employedSession = engine.createWorkStorySession({ definition: employedDefinition, profile });
  if (oldSession.storyId === employedSession.storyId || oldSession.entry === employedSession.entry
    || engine.careerStageFor(employedSession) !== 'employed') {
    errors.push('two story sessions must be isolated and employed story must start employed');
  }
  const legacy = registry.normalizeWorkStorySession({ ...oldSession, storyId: undefined, entry: undefined });
  if (legacy?.storyId !== oldDefinition.id || legacy?.entry !== 'job_lost') errors.push('0.1.x session must migrate to job_lost');
  if (registry.getWorkStoryDefinitionForSession({ ...oldSession, entry: 'job_exit' })) errors.push('a mismatched session entry must not resolve a definition');
  const employedNode = engine.resolveCurrentNode({ definition: employedDefinition, profile, session: employedSession });
  if (!employedNode || !employedNode.match.careerStages?.includes('employed')) errors.push('employed story opening must be eligible while employed');
  const viewModelUrl = dataUrl(read('src/domain/work-story/work-story-view-model.js').replace("from './story-engine.js'", `from '${engineUrl}'`));
  const viewModel = await import(viewModelUrl);
  const employedView = viewModel.createWorkStoryViewModel({ definition: employedDefinition, profile, session: employedSession });
  if (employedView.displayTitle !== employedDefinition.careerStageTitles?.employed) errors.push('employed story opening must use its definition display title');
  const fixedProfiles = sampleFile.samples.map((sample) => {
    const query = new URLSearchParams(sample.query);
    query.set('target', '2026-08-14 12:00');
    return buildAstrolabe(query).reading.workStoryProfile;
  });
  const fixedOpenings = fixedProfiles.map((fixedProfile) => {
    const session = engine.createWorkStorySession({ definition: employedDefinition, profile: fixedProfile });
    const view = viewModel.createWorkStoryViewModel({ definition: employedDefinition, profile: fixedProfile, session });
    const node = view.node;
    const allFusionEvidence = (node?.evidence || []).filter((item) => item.title !== '命理依据（部分匹配）');
    if (!node || allFusionEvidence.length < 3 || node.evidence.some((item) => item.title === '命理依据（部分匹配）')) {
      errors.push('a fixed chart opening must render its selected employed-story fusion with three-layer evidence');
    }
    return node?.id;
  });
  if (new Set(fixedOpenings.filter(Boolean)).size < 2 || fixedOpenings.some((id) => !['EL01', 'EL02', 'EL03'].includes(id))) {
    errors.push(`six fixed chart profiles must produce at least two employed openings; got ${fixedOpenings.join(', ')}`);
  }
  const datedQuery = new URLSearchParams(sampleFile.samples[0].query);
  const datedProfileAt = (target) => {
    const query = new URLSearchParams(datedQuery);
    query.set('target', target);
    return buildAstrolabe(query).reading.workStoryProfile;
  };
  const datedNodeTrace = (fixedProfile) => {
    let session = engine.createWorkStorySession({ definition: employedDefinition, profile: fixedProfile });
    const trace = [];
    for (let stageIndex = 0; stageIndex < 6; stageIndex += 1) {
      const node = engine.resolveCurrentNode({ definition: employedDefinition, profile: fixedProfile, session });
      if (!node) return trace;
      if ([0, 3, 5].includes(stageIndex)) {
        const evidence = node.evidenceSlots.flatMap((slot) => (slot.ruleIds || []).flatMap((ruleId) => fixedProfile.evidenceByRuleId?.[ruleId] || []))
          .map((item) => `${item.title || ''}:${item.body || ''}`).join('|');
        trace.push(`${node.id}:${evidence}`);
      }
      session = engine.advanceStory({ definition: employedDefinition, profile: fixedProfile, session: engine.chooseStoryOption({ definition: employedDefinition, profile: fixedProfile, session, choiceId: node.choices[0].id }) });
    }
    return trace;
  };
  const earlyTrace = datedNodeTrace(datedProfileAt('2026-08-14 12:00'));
  const laterTrace = datedNodeTrace(datedProfileAt('2028-05-14 12:00'));
  if (!earlyTrace.length || !laterTrace.length || earlyTrace.join('|') === laterTrace.join('|')) {
    errors.push('a representative date change must alter an employed-story candidate or evidence at act 1, 4, or 6');
  }
  const stageEffectDefinition = JSON.parse(JSON.stringify(oldDefinition));
  stageEffectDefinition.nodes.find((node) => node.id === 'JL01').choices[0].careerStageEffect = 'preboarding';
  const stageEffectProfile = { ...profile, tags: ['astro:fusion:M01', 'astro:fusion:M02', 'astro:fusion:M04', 'astro:fusion:M10'] };
  const stageEffectSession = engine.createWorkStorySession({ definition: stageEffectDefinition, profile: stageEffectProfile });
  const stageEffectNode = engine.resolveCurrentNode({ definition: stageEffectDefinition, profile: stageEffectProfile, session: stageEffectSession });
  const afterStageEffect = engine.chooseStoryOption({ definition: stageEffectDefinition, profile: stageEffectProfile, session: stageEffectSession, choiceId: stageEffectNode.choices[0].id });
  if (engine.careerStageFor(afterStageEffect) !== 'preboarding') errors.push('choice careerStageEffect must override the prior stage explicitly');

  if (employedDefinition.nodes.length !== 21 || employedDefinition.endings.length !== 6
    || employedDefinition.nodes.some((node) => node.choices?.length !== 3 || !node.copy?.transition?.trim())
    || new Set(employedDefinition.nodes.map((node) => node.id)).size !== 21) {
    errors.push('employed definition must contain 21 unique transitioned nodes, three choices each, and six endings');
  }
  const validTargets = new Set([...employedDefinition.nodes.map((node) => node.id), ...employedDefinition.endings.map((ending) => ending.id)]);
  if (employedDefinition.nodes.flatMap((node) => node.choices || []).flatMap((choice) => choice.delayedFlags || [])
    .some((flag) => !Array.isArray(flag.consumeBy) || !flag.consumeBy.length || flag.consumeBy.some((target) => !validTargets.has(target)))) {
    errors.push('every employed-story delayed flag must consume at a known node or ending');
  }
  const sequenceAt = (value) => Array.from({ length: 7 }, (_item, index) => Math.floor(value / (3 ** (6 - index))) % 3);
  const reachableEndings = new Set();
  for (let sequenceValue = 0; sequenceValue < 3 ** 7; sequenceValue += 1) {
    const indexes = sequenceAt(sequenceValue);
    let session = engine.createWorkStorySession({ definition: employedDefinition, profile });
    let failed = false;
    for (let stageIndex = 0; stageIndex < 7; stageIndex += 1) {
      const node = engine.resolveCurrentNode({ definition: employedDefinition, profile, session });
      const choice = node?.choices?.[indexes[stageIndex]];
      if (!node || !choice) {
        errors.push(`employed story sequence ${sequenceValue} cannot resolve stage ${stageIndex + 1}`);
        failed = true;
        break;
      }
      try {
        session = engine.advanceStory({
          definition: employedDefinition,
          profile,
          session: engine.chooseStoryOption({ definition: employedDefinition, profile, session, choiceId: choice.id }),
        });
      } catch (error) {
        errors.push(`employed story sequence ${sequenceValue} failed at stage ${stageIndex + 1}: ${error.message}`);
        failed = true;
        break;
      }
    }
    if (!failed && !session.completed) errors.push(`employed story sequence ${sequenceValue} did not complete after seven stages`);
    if (!failed && session.completed) {
      const endingId = engine.resolveEnding({ definition: employedDefinition, profile, session })?.id;
      if (!endingId) errors.push(`employed story sequence ${sequenceValue} has no ending`);
      else reachableEndings.add(endingId);
    }
  }
  if (reachableEndings.size !== 6 || employedDefinition.endings.some((ending) => !reachableEndings.has(ending.id))) {
    errors.push(`all six employed endings must be reachable; got ${[...reachableEndings].join(', ')}`);
  }

  const ending = {
    title: '稳妥跳槽',
    summaryText: '把条件和交接写清，再走向下一份工作。',
    summary: { core: '把条件和交接写清，再走向下一份工作。' },
  };
  const privateProfile = { ...profile, source: { date: '1995-03-12', birthTime: '07:30', birthPlace: '徐州', pillars: '甲子' } };
  const model = shareModel.createWorkStoryShareModel({ definition: employedDefinition, profile: privateProfile, session: { ...employedSession, choices: [{ choiceLabel: '先核实书面职责' }, { choiceLabel: '保留退出边界' }, { choiceLabel: '完成交接' }] }, ending });
  const serialized = JSON.stringify(model);
  if (!model?.keyChoices?.length || ['1995-03-12', '07:30', '徐州', '甲子'].some((secret) => serialized.includes(secret))) errors.push('share model must allow-list non-private fields only');
  employedDefinition.endings.forEach((storyEnding) => {
    const endingModel = shareModel.createWorkStoryShareModel({ definition: employedDefinition, profile, session: employedSession, ending: { ...storyEnding, title: storyEnding.summary.title, summaryText: storyEnding.summary.core } });
    if (!storyEnding.summary.alternativeHint || endingModel?.alternative !== storyEnding.summary.alternativeHint) {
      errors.push(`share model must preserve alternativeHint for ${storyEnding.id}`);
    }
  });
  const canvasTextY = [];
  const fakeCanvas = {
    getContext: () => ({ fillStyle: '', font: '', fillRect() {}, fillText: (_value, _x, y) => canvasTextY.push(y), measureText: (value) => ({ width: String(value).length * 16 }) }),
    toDataURL: () => 'data:image/png;base64,TEST',
  };
  const fakeDocument = { createElement: (name) => (name === 'canvas' ? fakeCanvas : { click() {} }) };
  const png = shareCard.createWorkStorySharePng(model, fakeDocument);
  const longestEnding = [...employedDefinition.endings].sort((left, right) => `${right.summary.core}${right.summary.alternativeHint}`.length - `${left.summary.core}${left.summary.alternativeHint}`.length)[0];
  shareCard.createWorkStorySharePng(shareModel.createWorkStoryShareModel({ definition: employedDefinition, profile, session: { ...employedSession, choices: [{ choiceLabel: '一段很长的关键选择文案，用于验证分享卡会截断而不会冲出画布边界。' }, { choiceLabel: '第二段很长的关键选择文案，用于验证固定区域。' }, { choiceLabel: '第三段很长的关键选择文案，用于验证固定区域。' }] }, ending: { ...longestEnding, title: longestEnding.summary.title, summaryText: longestEnding.summary.core } }), fakeDocument);
  if (!png.dataUrl.startsWith('data:image/png') || fakeCanvas.width !== 1080 || fakeCanvas.height !== 1350 || Math.max(...canvasTextY) > 1270) errors.push('share PNG renderer must constrain real long copy inside the fixed canvas image');
  if (!/navigatorRef\.share|downloadWorkStorySharePng/.test(read('src/components/work-story-share-card.js'))) errors.push('share card must support native sharing with PNG download fallback');

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exit(1);
  }
  console.log('PASS multi-story registry, 2,187 employed paths/six endings, career stage, profile evidence, legacy session, privacy-safe share model and PNG renderer');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
