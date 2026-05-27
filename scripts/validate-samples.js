#!/usr/bin/env node

const path = require('path');
const { buildAstrolabe } = require('../server');

const sampleFile = require('../data/samples/astrolabe-samples.json');

const buildParams = (query) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return params;
};

const includesAll = (haystack, needles) => needles.filter((item) => !haystack.includes(item));
const plainManualTitle = (title) => String(title || '').replace(/^第\d+章：/, '');
const overlapCount = (left, right) => left.filter((item) => right.includes(item)).length;

const validateSample = (sample) => {
  const result = buildAstrolabe(buildParams(sample.query));
  const errors = [];
  const expect = sample.expect;
  const reading = result.reading;

  if (reading.manual.length < (expect.manualCountAtLeast || 0)) {
    errors.push(`manual count ${reading.manual.length} < ${expect.manualCountAtLeast}`);
  }
  if (reading.references.length < (expect.referencesAtLeast || 0)) {
    errors.push(`references count ${reading.references.length} < ${expect.referencesAtLeast}`);
  }
  if (reading.knowledgeHits.length < (expect.knowledgeHitsAtLeast || 0)) {
    errors.push(`knowledge hits ${reading.knowledgeHits.length} < ${expect.knowledgeHitsAtLeast}`);
  }
  if ((reading.retrieval || []).length < (expect.retrievalAtLeast || 0)) {
    errors.push(`retrieval count ${(reading.retrieval || []).length} < ${expect.retrievalAtLeast}`);
  }
  if (!Array.isArray(reading.patterns)) {
    errors.push('reading.patterns is missing');
  }
  if (!reading.patternPlan || !reading.patternPlan.stage1 || !reading.patternPlan.stage2) {
    errors.push('reading.patternPlan is missing');
  }
  if (!reading.lifeGame) {
    errors.push('reading.lifeGame is missing');
  }
  if (Array.isArray(reading.patterns) && reading.patterns.some((item) => (
    !item.name
    || !item.verdict
    || !item.summary
    || !Array.isArray(item.conditions)
    || !Array.isArray(item.caveats)
    || !Array.isArray(item.sources)
    || !item.ruleLevel
    || !item.ruleLevelLabel
  ))) {
    errors.push('invalid pattern structure');
  }
  if (expect.patternsAtLeast && (reading.patterns || []).length < expect.patternsAtLeast) {
    errors.push(`patterns count ${(reading.patterns || []).length} < ${expect.patternsAtLeast}`);
  }
  if (expect.requiredPatterns) {
    const missing = includesAll((reading.patterns || []).map((item) => item.name), expect.requiredPatterns);
    if (missing.length) {
      errors.push(`missing patterns: ${missing.join(', ')}`);
    }
  }
  if (expect.requiredStage2Patterns) {
    const missing = includesAll(
      (reading.patterns || []).filter((item) => item.category === 'stage2').map((item) => item.name),
      expect.requiredStage2Patterns,
    );
    if (missing.length) {
      errors.push(`missing stage2 patterns: ${missing.join(', ')}`);
    }
  }

  if (expect.requiredTopics) {
    const missing = includesAll(reading.topics.map((item) => item.title), expect.requiredTopics);
    if (missing.length) {
      errors.push(`missing topics: ${missing.join(', ')}`);
    }
  }

  if (expect.minZiweiStructureTopics) {
    const count = reading.topics.filter((item) => (item.ziweiStructure || []).length > 0).length;
    if (count < expect.minZiweiStructureTopics) {
      errors.push(`ziwei structure topics ${count} < ${expect.minZiweiStructureTopics}`);
    }
  }

  if (expect.minBaziStructureTopics) {
    const count = reading.topics.filter((item) => (item.baziStructure || []).length > 0).length;
    if (count < expect.minBaziStructureTopics) {
      errors.push(`bazi structure topics ${count} < ${expect.minBaziStructureTopics}`);
    }
  }

  if (expect.requiredZiweiStructureTopics) {
    const names = reading.topics
      .filter((item) => (item.ziweiStructure || []).length > 0)
      .map((item) => item.title);
    const missing = includesAll(names, expect.requiredZiweiStructureTopics);
    if (missing.length) {
      errors.push(`missing ziwei-structured topics: ${missing.join(', ')}`);
    }
  }

  if (expect.requiredBaziStructureTopics) {
    const names = reading.topics
      .filter((item) => (item.baziStructure || []).length > 0)
      .map((item) => item.title);
    const missing = includesAll(names, expect.requiredBaziStructureTopics);
    if (missing.length) {
      errors.push(`missing bazi-structured topics: ${missing.join(', ')}`);
    }
  }

  const invalidTopics = reading.topics.filter((item) => (
    !item.takeaway
    || !item.drivers
    || !item.drivers.length
    || !Array.isArray(item.ziweiStructure)
    || !Array.isArray(item.baziStructure)
    || !Array.isArray(item.patterns)
  ));
  if (invalidTopics.length) {
    errors.push(`invalid topic structure: ${invalidTopics.map((item) => item.title).join(', ')}`);
  }

  const invalidManual = reading.manual.filter((item) => !Array.isArray(item.patterns));
  if (invalidManual.length) {
    errors.push(`invalid manual pattern structure: ${invalidManual.map((item) => item.title).join(', ')}`);
  }

  const lifeGame = reading.lifeGame;
  if (lifeGame) {
    if (!lifeGame.archetype?.name || !lifeGame.headline || !lifeGame.stats) {
      errors.push('invalid lifeGame hero structure');
    }
    if (!Array.isArray(lifeGame.trials) || lifeGame.trials.length < 3) {
      errors.push(`lifeGame trials ${(lifeGame.trials || []).length} < 3`);
    }
    if (!Array.isArray(lifeGame.opportunities) || lifeGame.opportunities.length < 2) {
      errors.push(`lifeGame opportunities ${(lifeGame.opportunities || []).length} < 2`);
    }
    if (!Array.isArray(lifeGame.stages) || lifeGame.stages.length < 3) {
      errors.push(`lifeGame stages ${(lifeGame.stages || []).length} < 3`);
    }
    if (!Array.isArray(lifeGame.cards) || lifeGame.cards.length !== ((lifeGame.trials || []).length + (lifeGame.opportunities || []).length)) {
      errors.push('lifeGame cards count mismatch');
    }

    const invalidCards = (lifeGame.cards || []).filter((card) => (
      !card.title
      || !card.theme
      || !card.triggerSummary
      || !Array.isArray(card.choices)
      || card.choices.length !== 3
      || card.choices.some((choice) => !choice.cost || !choice.reward || !choice.feedback || !choice.statEffects)
    ));
    if (invalidCards.length) {
      errors.push(`invalid lifeGame cards: ${invalidCards.map((item) => item.title).join(', ')}`);
    }

    const invalidStages = (lifeGame.stages || []).filter((stage) => (
      !stage.ageRange
      || !stage.ganZhi
      || !stage.title
      || !stage.strategy
    ));
    if (invalidStages.length) {
      errors.push(`invalid lifeGame stages: ${invalidStages.map((item) => item.title).join(', ')}`);
    }
  }

  if (expect.manualTitles) {
    const missing = includesAll(reading.manual.map((item) => item.title), expect.manualTitles);
    if (missing.length) {
      errors.push(`missing manual titles: ${missing.join(', ')}`);
    }
  }

  if (expect.manualSections) {
    const missing = includesAll(reading.manual.map((item) => plainManualTitle(item.title)), expect.manualSections);
    if (missing.length) {
      errors.push(`missing manual sections: ${missing.join(', ')}`);
    }
  }

  if (expect.requiredHitTopics) {
    const missing = includesAll(reading.knowledgeHits.map((item) => item.topic), expect.requiredHitTopics);
    if (missing.length) {
      errors.push(`missing hit topics: ${missing.join(', ')}`);
    }
  }

  if (expect.requiredReferenceSources) {
    const sources = Array.from(new Set(reading.references.map((item) => item.source).concat(
      reading.manual.flatMap((item) => (item.references || []).map((ref) => ref.source))
    )));
    const missing = includesAll(sources, expect.requiredReferenceSources);
    if (missing.length) {
      errors.push(`missing reference sources: ${missing.join(', ')}`);
    }
  }

  if (expect.requiredRetrievalSources) {
    const missing = includesAll((reading.retrieval || []).map((item) => item.source), expect.requiredRetrievalSources);
    if (missing.length) {
      errors.push(`missing retrieval sources: ${missing.join(', ')}`);
    }
  }

  return {
    id: sample.id,
    label: sample.label,
    ok: errors.length === 0,
    errors,
    snapshot: {
      headline: reading.headline,
      manualCount: reading.manual.length,
      references: reading.references.length,
      knowledgeHits: reading.knowledgeHits.length,
      retrieval: (reading.retrieval || []).length,
      patterns: (reading.patterns || []).map((item) => item.name),
      archetype: reading.lifeGame?.archetype?.name || '',
      lifeGameTrials: reading.lifeGame?.trials?.map((item) => item.title) || [],
      lifeGameOpportunities: reading.lifeGame?.opportunities?.map((item) => item.title) || [],
      lifeGameOpportunityIds: reading.lifeGame?.opportunities?.map((item) => item.id) || [],
      topics: reading.topics.map((item) => item.title),
    },
  };
};

const results = sampleFile.samples.map(validateSample);
const failed = results.filter((item) => !item.ok);

const globalErrors = [];
const passedLifeGames = results.filter((item) => item.ok);
const archetypes = Array.from(new Set(passedLifeGames.map((item) => item.snapshot.archetype).filter(Boolean)));
if (passedLifeGames.length && archetypes.length < 3) {
  globalErrors.push(`lifeGame archetypes too concentrated: ${archetypes.join(', ')}`);
}

const distinctOpportunityIds = new Set(
  passedLifeGames.flatMap((item) => item.snapshot.lifeGameOpportunityIds || []),
);
if (passedLifeGames.length && distinctOpportunityIds.size < 7) {
  globalErrors.push(`lifeGame opportunities too concentrated: only ${distinctOpportunityIds.size} distinct ids`);
}

for (let index = 0; index < passedLifeGames.length; index += 1) {
  for (let next = index + 1; next < passedLifeGames.length; next += 1) {
    const current = passedLifeGames[index];
    const other = passedLifeGames[next];
    const currentIds = current.snapshot.lifeGameOpportunityIds || [];
    const otherIds = other.snapshot.lifeGameOpportunityIds || [];
    const overlap = overlapCount(currentIds, otherIds);
    const ratio = overlap / Math.max(1, Math.min(currentIds.length, otherIds.length));
    if (ratio > 0.8) {
      globalErrors.push(`lifeGame opportunities overlap too high: ${current.id} vs ${other.id} = ${overlap}/${Math.min(currentIds.length, otherIds.length)}`);
    }
  }
}

results.forEach((item) => {
  const prefix = item.ok ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${item.id} ${item.label}`);
  if (!item.ok) {
    item.errors.forEach((error) => console.log(`  - ${error}`));
  }
});

if (failed.length) {
  console.error(`\n${failed.length} sample(s) failed.`);
  process.exit(1);
}

if (globalErrors.length) {
  globalErrors.forEach((error) => console.error(`GLOBAL - ${error}`));
  console.error(`\n${globalErrors.length} global regression check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${results.length} samples passed.`);
