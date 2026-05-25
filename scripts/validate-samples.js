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
  ));
  if (invalidTopics.length) {
    errors.push(`invalid topic structure: ${invalidTopics.map((item) => item.title).join(', ')}`);
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
      topics: reading.topics.map((item) => item.title),
    },
  };
};

const results = sampleFile.samples.map(validateSample);
const failed = results.filter((item) => !item.ok);

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

console.log(`\nAll ${results.length} samples passed.`);
