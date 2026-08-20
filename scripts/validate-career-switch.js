#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const errors = [];

const sequenceAt = (value) => Array.from({ length: 7 }, (_item, index) => Math.floor(value / (3 ** (6 - index))) % 3);

const main = async () => {
  const storyUrl = dataUrl(read('src/content/work-stories/career-switch.js'));
  const lifeUrl = dataUrl("export const createInitialLifeState=()=>({pressure:50,opportunity:50,relationship:50,stability:50,resources:50,wellbeing:50}); export const applyLifeStateDelta=(state,delta)=>Object.fromEntries(Object.keys(state).map((key)=>[key,Math.max(0,Math.min(100,(state[key]||50)+(delta[key]||0)))]));");
  const engineUrl = dataUrl(read('src/domain/work-story/story-engine.js').replace("from '../life-state.js'", `from '${lifeUrl}'`));
  const shareUrl = dataUrl(read('src/domain/work-story/share-model.js'));
  const catalogUrl = dataUrl(read('src/domain/work-story/story-catalog.js'));
  const [{ CAREER_SWITCH: definition }, engine, share, catalog] = await Promise.all([
    import(storyUrl), import(engineUrl), import(shareUrl), import(catalogUrl),
  ]);

  const contract = engine.validateStoryDefinition(definition);
  if (contract.length) errors.push(`contract: ${contract.join('；')}`);
  if (definition.id !== 'career_switch' || definition.entry !== 'career_switch'
    || definition.nodes.length !== 21 || definition.stages.length !== 7 || definition.endings.length !== 6
    || definition.nodes.some((node) => node.choices?.length !== 3 || !node.copy?.transition?.trim())) {
    errors.push('career_switch must contain 7 stages, 21 transitioned nodes, 3 choices each, and 6 endings');
  }
  const entry = catalog.WORK_STORY_ENTRIES.find((item) => item.id === 'career_switch');
  if (entry?.status !== 'available' || entry?.storyId !== 'career_switch') errors.push('catalog must expose career_switch as an available registered story');

  const validTargets = new Set([...definition.nodes.map((node) => node.id), ...definition.endings.map((ending) => ending.id)]);
  definition.nodes.flatMap((node) => node.choices).flatMap((choice) => choice.delayedFlags).forEach((item) => {
    if (!item.consumeBy?.length || item.consumeBy.some((target) => !validTargets.has(target))) errors.push(`flag ${item.id} has an unknown consume target`);
  });

  const profiles = [
    { label: 'proof-opening', tags: ['astro:fusion:M03', 'astro:fusion:M06'], rankedFocuses: ['opportunity'] },
    { label: 'move-opening', tags: ['astro:fusion:M05', 'astro:fusion:M03'], rankedFocuses: ['transition'] },
    { label: 'cash-rest-opening', tags: ['astro:fusion:M01', 'astro:fusion:M07'], rankedFocuses: ['recovery', 'safety'] },
    { label: 'income-opening', tags: ['astro:fusion:M10', 'astro:fusion:M03'], rankedFocuses: ['opportunity'] },
  ].map((profile) => ({ available: true, initialState: {}, ...profile }));
  const nodesSeen = new Set();
  const choicesSeen = new Set();
  const endingsSeen = new Set();
  const producedFlags = new Set();
  const openingIds = new Set();

  profiles.forEach((profile) => {
    const firstSession = engine.createWorkStorySession({ definition, profile });
    const firstNode = engine.resolveCurrentNode({ definition, profile, session: firstSession });
    if (firstNode?.id) openingIds.add(firstNode.id);
    for (let value = 0; value < 3 ** 7; value += 1) {
      let session = engine.createWorkStorySession({ definition, profile });
      const indexes = sequenceAt(value);
      for (let stage = 0; stage < 7; stage += 1) {
        const node = engine.resolveCurrentNode({ definition, profile, session });
        const selected = node?.choices?.[indexes[stage]];
        if (!node || !selected) {
          errors.push(`${profile.label} path ${value} cannot resolve stage ${stage + 1}`);
          break;
        }
        const activeTags = new Set([...(profile.tags || []), `entry:${session.entry}`, ...Object.keys(session.flags || {}).map((flag) => `flag:${flag}`)]);
        if (!(node.match?.anyTags || []).some((tag) => activeTags.has(tag))) {
          errors.push(`${profile.label} path ${value} stage ${stage + 1} reaches ${node.id} only by fallback, without a matching profile/fact tag`);
          break;
        }
        nodesSeen.add(node.id);
        choicesSeen.add(selected.id);
        selected.delayedFlags.forEach((item) => producedFlags.add(item.id));
        session = engine.advanceStory({
          definition,
          profile,
          session: engine.chooseStoryOption({ definition, profile, session, choiceId: selected.id }),
        });
      }
      if (session.completed) {
        const ending = engine.resolveEnding({ definition, profile, session });
        if (ending?.id) endingsSeen.add(ending.id);
        else errors.push(`${profile.label} path ${value} has no ending`);
      } else {
        errors.push(`${profile.label} path ${value} did not complete`);
      }
    }
  });

  const deadNodes = definition.nodes.map((node) => node.id).filter((id) => !nodesSeen.has(id));
  const deadChoices = definition.nodes.flatMap((node) => node.choices.map((choice) => choice.id)).filter((id) => !choicesSeen.has(id));
  const deadEndings = definition.endings.map((ending) => ending.id).filter((id) => !endingsSeen.has(id));
  if (openingIds.size < 3) errors.push(`three different chart-driven openings expected; got ${[...openingIds].join(', ')}`);
  if (deadNodes.length || deadChoices.length || deadEndings.length) errors.push(`coverage dead nodes=${deadNodes.join(',') || '0'} choices=${deadChoices.join(',') || '0'} endings=${deadEndings.join(',') || '0'}`);

  const stageAfterFlag = (flag) => {
    const profile = profiles[0];
    const session = { ...engine.createWorkStorySession({ definition, profile }), sceneIndex: 3, flags: { [flag]: true } };
    return engine.resolveCurrentNode({ definition, profile, session })?.id;
  };
  const cs09Continuity = {
    paid_micro_project: stageAfterFlag('paid_micro_project'),
    free_case_for_testimonial: stageAfterFlag('free_case_for_testimonial'),
    micro_project_declined: stageAfterFlag('micro_project_declined'),
  };
  if (cs09Continuity.paid_micro_project !== 'CS11'
    || cs09Continuity.free_case_for_testimonial !== 'CS11'
    || cs09Continuity.micro_project_declined !== 'CS11') {
    errors.push(`CS09 choices must flow into the work-credit cost node CS11 at act four; got ${JSON.stringify(cs09Continuity)}`);
  }

  const endingWithPrivateProfile = {
    ...definition.endings[0],
    title: definition.endings[0].summary.title,
    summaryText: definition.endings[0].summary.core,
  };
  const shareModel = share.createWorkStoryShareModel({
    definition,
    profile: { ...profiles[0], source: { date: '1986-07-29', birthTime: '07:30', birthPlace: '徐州', pillars: '丙寅' } },
    session: engine.createWorkStorySession({ definition, profile: profiles[0] }),
    ending: endingWithPrivateProfile,
  });
  const serialized = JSON.stringify(shareModel);
  if (['1986-07-29', '07:30', '徐州', '丙寅'].some((secret) => serialized.includes(secret))) errors.push('share model leaks private source data');
  const socialText = share.shareTextForWorkStory(shareModel);
  if (!socialText.includes('8 周试验') || !socialText.includes('如果你想转行') || ['我的3个关键选择', '另一种可能'].some((phrase) => socialText.includes(phrase))) {
    errors.push('career_switch share copy must be contextual and social, not an internal result transcript');
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`FAIL ${error}`));
    process.exit(1);
  }
  console.log('PASS career_switch: contract, catalog, 21 nodes, 63 choices, 6 endings, no fallback-only stage transitions, CS09 act-four continuity and privacy-safe share copy');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
