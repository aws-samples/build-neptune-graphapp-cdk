export const getRelationName = /* GraphQL */ `
  query getRelationName($type: String!, $name: String!, $value: String!) {
    getRelationName(type: $type, name: $name, value: $value) {
      name
    }
  }
`;

export const getProfile = /* GraphQL */ `
  query getProfile($type: String!, $name: String!, $value: String!) {
    getProfile(type: $type, name: $name, value: $value) {
      search_name
      usage
      belong_to
      authored_by
      affiliated_with
      people
      made_by
    }
  }
`;
export const getGraph = /* GraphQL */ `
  query getGraph($type: String!, $value: String!) {
    getGraph(type: $type, value: $value) {
      nodes {
        id
        label
      }
      links {
        source
        target
        value
      }
    }
  }
`;
