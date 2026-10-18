import { describe, it, expect } from 'vitest';
import {
  assessmentQuestions,
  computeDimensionScoresById,
  getAssessmentSuggestions,
  sampleAssessmentQuestions,
} from '@/data/assessment-data';

describe('Assessment Randomization & Suggestion Architecture', () => {
  it('contains an expanded question bank of 16 questions (4 per dimension)', () => {
    expect(assessmentQuestions.length).toBe(16);

    const pikiran = assessmentQuestions.filter((q) => q.dimensionKey === 'pikiran');
    const emosi = assessmentQuestions.filter((q) => q.dimensionKey === 'emosi');
    const spiritual = assessmentQuestions.filter((q) => q.dimensionKey === 'spiritual');
    const sosial = assessmentQuestions.filter((q) => q.dimensionKey === 'sosial');

    expect(pikiran.length).toBe(4);
    expect(emosi.length).toBe(4);
    expect(spiritual.length).toBe(4);
    expect(sosial.length).toBe(4);
  });

  it('sampleAssessmentQuestions selects exactly 8 questions (2 per dimension) deterministically with seed', () => {
    const sampleA = sampleAssessmentQuestions('session-alpha');
    const sampleB = sampleAssessmentQuestions('session-alpha');
    const sampleC = sampleAssessmentQuestions('session-beta');

    expect(sampleA.length).toBe(8);
    expect(sampleA).toEqual(sampleB);
    expect(sampleA).not.toEqual(sampleC);

    // Ensure 2 questions per dimension
    const counts: Record<string, number> = {};
    sampleA.forEach((q) => {
      counts[q.dimensionKey] = (counts[q.dimensionKey] || 0) + 1;
    });

    expect(counts['pikiran']).toBe(2);
    expect(counts['emosi']).toBe(2);
    expect(counts['spiritual']).toBe(2);
    expect(counts['sosial']).toBe(2);
  });

  it('computeDimensionScoresById accurately calculates scores based on question ID regardless of order', () => {
    const sampled = sampleAssessmentQuestions('test-seed-1');
    const answersById: Record<number, number> = {};

    // Give high scores (3) to spiritual & sosial, low (0) to pikiran & emosi
    sampled.forEach((q) => {
      if (q.dimensionKey === 'pikiran' || q.dimensionKey === 'emosi') {
        answersById[q.id] = 0;
      } else {
        answersById[q.id] = 3;
      }
    });

    const dimScores = computeDimensionScoresById(answersById, sampled);
    expect(dimScores.length).toBe(4);

    const pikiran = dimScores.find((d) => d.key === 'pikiran')!;
    const spiritual = dimScores.find((d) => d.key === 'spiritual')!;

    expect(pikiran.score).toBe(0);
    expect(pikiran.status).toBe('need_attention');
    expect(spiritual.score).toBe(6);
    expect(spiritual.status).toBe('optimal');
  });

  it('getAssessmentSuggestions maps lowest dimension to tailored articles and counseling booking topic', () => {
    const sampled = sampleAssessmentQuestions('test-seed-2');
    const answersById: Record<number, number> = {};

    sampled.forEach((q) => {
      // make 'pikiran' the lowest
      answersById[q.id] = q.dimensionKey === 'pikiran' ? 0 : 3;
    });

    const dimScores = computeDimensionScoresById(answersById, sampled);
    const suggestion = getAssessmentSuggestions(dimScores);

    expect(suggestion.lowestDimension.key).toBe('pikiran');
    expect(suggestion.recommendedTopic).toContain('Overthinking');
    expect(suggestion.relatedArticles.length).toBeGreaterThan(0);
    expect(suggestion.whatsappNote).toContain('Pikiran');
  });

  it('sampleAssessmentQuestions shuffles question options to prevent position/acquiescence bias', () => {
    const sampled = sampleAssessmentQuestions('debias-seed-99');
    expect(sampled.length).toBe(8);

    // Verify all 4 score levels (0, 1, 2, 3) exist in each question
    sampled.forEach((q) => {
      const scores = q.options.map((opt) => opt.score);
      expect(scores.length).toBe(4);
      expect([...scores].sort()).toEqual([0, 1, 2, 3]);
    });

    // Check that not every question has the static [3, 2, 1, 0] descending order
    const isAllDescending = sampled.every((q) => {
      const scores = q.options.map((opt) => opt.score);
      return scores[0] === 3 && scores[1] === 2 && scores[2] === 1 && scores[3] === 0;
    });

    expect(isAllDescending).toBe(false);
  });

  it('getAssessmentSuggestions resolves ties via clinical urgency (emosi over pikiran/sosial)', () => {
    const sampled = sampleAssessmentQuestions('tie-seed-1');
    const answersById: Record<number, number> = {};

    // Give both pikiran and emosi 0 score, while spiritual and sosial get 3
    sampled.forEach((q) => {
      if (q.dimensionKey === 'pikiran' || q.dimensionKey === 'emosi') {
        answersById[q.id] = 0;
      } else {
        answersById[q.id] = 3;
      }
    });

    const dimScores = computeDimensionScoresById(answersById, sampled);
    const suggestion = getAssessmentSuggestions(dimScores);

    // Emosi has higher clinical urgency than pikiran in tie-breaker
    expect(suggestion.lowestDimension.key).toBe('emosi');
    expect(suggestion.recommendedTopic).toContain('Burnout');
  });
});
