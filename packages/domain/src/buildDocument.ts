export const DOMAIN_SCHEMA_VERSION = 1 as const;

export interface BuildDocument {
  id: string;
  schemaVersion: typeof DOMAIN_SCHEMA_VERSION;
  name: string;
  partInstances: readonly unknown[];
  connections: readonly unknown[];
  usedDefinitionIds: readonly string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmptyBuildDocumentInput {
  id: string;
  name: string;
  now: string;
}

export function createEmptyBuildDocument(
  input: CreateEmptyBuildDocumentInput,
): BuildDocument {
  return {
    id: input.id,
    schemaVersion: DOMAIN_SCHEMA_VERSION,
    name: input.name,
    partInstances: [],
    connections: [],
    usedDefinitionIds: [],
    createdAt: input.now,
    updatedAt: input.now,
  };
}
