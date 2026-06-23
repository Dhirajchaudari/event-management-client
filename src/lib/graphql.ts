import {
  handleUnauthorizedRedirect,
  isUnauthorizedError,
  isUnauthorizedStatus,
  UnauthorizedError
} from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/graphql";

interface GraphQLResult<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

function rejectUnauthorized(message: string): never {
  handleUnauthorizedRedirect();
  throw new UnauthorizedError(message);
}

export async function gqlRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>
>(query: string, variables?: TVariables): Promise<TData> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      query,
      variables: (variables ?? null) as Record<string, unknown> | null
    })
  });

  if (isUnauthorizedStatus(response.status)) {
    rejectUnauthorized("UNAUTHENTICATED");
  }

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`);
  }

  const json = (await response.json()) as GraphQLResult<TData>;

  if (json.errors?.length) {
    const message = json.errors[0]?.message ?? "GraphQL error";
    if (isUnauthorizedError(message)) {
      rejectUnauthorized(message);
    }
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error("GraphQL response missing data");
  }

  return json.data;
}

export { UnauthorizedError };
