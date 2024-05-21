export const radioGroupValue = [
  {
    value: "person",
    label:
      "Search for 'Acadmic member' of Affiliated academic society from 'Person Name'",
    description: "'Person' -> Affiliated academic society -> 'Acadmic member'",
  },
  {
    value: "product",
    label: "Search for 'Co Author' of Paper from the User of 'Product Name'",
    description: "'Product' -> Person -> -> Paper -> 'Co Author'",
  },
  {
    value: "conference",
    label:
      "Search for 'Acquaintance' of Acadmic member from 'Affiliated academic society'",
    description:
      "'Affiliated academic society' -> Academic member -> 'Acquaintance'",
  },
];

export const selectEdgeItem = [
  {
    value: "affiliated_with",
    description: "Institution",
    source: "Person",
    sourceLabel: "person",
    destination: "Institution",
    destLabel: "institution",
  },
  {
    value: "authored_by",
    description: "Paper",
    source: "Paper",
    sourceLabel: "paper",
    destination: "Person",
    destLabel: "person",
  },
  {
    value: "belong_to",
    description: "Affiliated academic society",
    source: "Person",
    sourceLabel: "person",
    destination: "Academic society",
    destLabel: "conference",
  },
  {
    value: "usage",
    description: "Products to use",
    source: "Person",
    sourceLabel: "person",
    destination: "Product",
    destLabel: "product",
  },
  {
    value: "knows",
    description: "Know",
    source: "Person",
    sourceLabel: "person",
    destination: "Person",
    destLabel: "person",
  },
  {
    value: "made_by",
    description: "Seller",
    source: "Pharmaceutical company",
    sourceLabel: "institution",
    destination: "Product",
    destLabel: "product",
  },
];

export const selectVertexItem = [
  {
    value: "person",
    description: "Person",
    input: "speciality",
  },
  {
    value: "paper",
    description: "Paper",
    input: "publich date",
  },
  {
    value: "product",
    description: "Product",
  },
  {
    value: "conference",
    description: "Affiliated academic society",
  },
  {
    value: "institution",
    description: "Institution",
  },
];

export const Profiles = [
  {
    value: "search_name",
    description: "Search word",
  },
  {
    value: "affiliated_with",
    description: "Institution",
  },
  {
    value: "usage",
    description: "Use",
  },
  {
    value: "belong_to",
    description: "Affiliated academic society",
  },
  {
    value: "authored_by",
    description: "Paper",
  },
  {
    value: "people",
    description: "Academic member",
  },
  {
    value: "made_by",
    description: "Pharmaceutical company",
  },
];
