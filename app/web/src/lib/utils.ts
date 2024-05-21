import { getGraph, getProfile, getRelationName } from "@/api/appsync/query";
import {
  GetGraphQuery,
  GetRelationNameQuery,
  GetProfileQuery,
} from "@/types/types";
import { GraphQLResult, generateClient } from "aws-amplify/api";
import { type ClassValue, clsx } from "clsx";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Icons = {
  spinner: Loader2,
};

export const queryGetProfile = async (name: string, value: string) => {
  const client = generateClient();
  const res = (await client.graphql({
    query: getProfile,
    variables: {
      type: "profile",
      value,
      name,
    },
  })) as GraphQLResult<GetProfileQuery>;
  return res;
};

export const queryGetRelationName = async (name: string, value: string) => {
  const client = generateClient();
  const res = (await client.graphql({
    query: getRelationName,
    variables: {
      type: "relation",
      value,
      name: name,
    },
  })) as GraphQLResult<GetRelationNameQuery>;
  return res;
};

export const queryGetGraph = async (value: string) => {
  const client = generateClient();
  const res = (await client.graphql({
    query: getGraph,
    variables: {
      type: "graph",
      value,
    },
  })) as GraphQLResult<GetGraphQuery>;
  return res;
};
