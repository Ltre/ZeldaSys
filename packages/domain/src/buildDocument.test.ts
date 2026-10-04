import { describe, expect, it } from 'vitest';

import {
  DOMAIN_SCHEMA_VERSION,
  createEmptyBuildDocument,
} from './buildDocument';

describe('createEmptyBuildDocument', () => {
  it('creates a versioned empty project document', () => {
    const document = createEmptyBuildDocument({
      id: 'build-1',
      name: 'Untitled Build',
      now: '2026-10-04T00:00:00.000Z',
    });

    expect(document).toEqual({
      id: 'build-1',
      schemaVersion: DOMAIN_SCHEMA_VERSION,
      name: 'Untitled Build',
      partInstances: [],
      connections: [],
      usedDefinitionIds: [],
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
    });
  });
});
