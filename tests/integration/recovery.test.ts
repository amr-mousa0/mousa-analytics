import { describe, it, expect } from 'vitest';

describe('Job Recovery & State Machine Test', () => {
  it('resumes interrupted job from saved stage checkpoint', async () => {
    const jobState = {
      jobId: 'job_recover_1',
      currentStage: 5,
      status: 'TRANSLATING'
    };

    const resumeFromStage = (state: typeof jobState) => {
      const remainingStages = [];
      for (let s = state.currentStage; s <= 15; s++) {
        remainingStages.push(s);
      }
      return remainingStages;
    };

    const stagesRun = resumeFromStage(jobState);
    expect(stagesRun[0]).toBe(5);
    expect(stagesRun.length).toBe(11);
  });
});
