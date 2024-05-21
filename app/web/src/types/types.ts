export type ErrorMessage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message?: any;
};

export type EdgeItem = {
  value: string;
  description: string;
  source: string;
  sourceLabel: string;
  destination: string;
  destLabel: string;
};

export type Result = {
  name: string;
};

export type InsertDataInput = {
  value: string;
  name?: string;
  edge?: string;
  vertex?: string;
  property?: string;
  source?: string;
  sourceLabel?: string;
  destination?: string;
  destLabel?: string;
};

export type Graph = {
  value: string;
  description: string;
  data: string;
};

export type GetRelationNameQuery = {
  getRelationName: Array<{
    name: string;
  }>;
};

export type GetProfileQuery = {
  getProfile: Array<{
    search_name: string;
    usage?: string;
    belong_to?: string;
    authored_by?: string;
    affiliated_with?: string;
    people?: string;
    made_by?: string;
  }>;
};

export type GetGraphQuery = {
  getGraph: {
    nodes: Array<{
      id: string;
      label: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      value: string;
    }>;
  };
};
