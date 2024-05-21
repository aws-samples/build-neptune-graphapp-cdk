export const registerInfo = /* GraphQL */ `
  mutation insertData($InsertDataInput: InsertDataInput!) {
    insertData(input: $InsertDataInput) {
      result
    }
  }
`;
