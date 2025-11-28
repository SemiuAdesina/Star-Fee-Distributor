import { gql } from "graphql-tag";

export const typeDefs = gql`
  type RegistryMetadata {
    authority: String!
    version: Int!
    metadataUri: String
    metadataChecksum: [Int!]
  }

  type CiStatus {
    pipeline: String!
    status: String!
    commit: String!
    runId: String!
    triggeredBy: String!
    timestamp: String!
  }

  type Query {
    registry(authority: String!): RegistryMetadata
    ciStatuses(limit: Int = 10): [CiStatus!]!
    ciStatus(runId: String!): CiStatus
  }
`;

