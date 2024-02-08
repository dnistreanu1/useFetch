import { useState } from "react";
import { HTTPHeader, HTTPStatusCode } from "../defs/enums";

type TypeUseWriterRequest = {
  url: string;
  method?: "POST" | "PUT" | "DELETE";
  deps?: Array<unknown>;
  options?: {
    headers?: [string, string][];
    fetchOptions?: Partial<RequestInit>;
    logger: (obj: any) => void;
  };
};

export type TypeUseWriterResponse<TRequestData, TResponseData> = {
  isResponseOk: boolean | null;
  isLoading: boolean;
  error: number | null;
  requestId: string | null; // used to track individual API requests
  requestData: TRequestData | null;
  responseData: TResponseData | null;
  writeData: (
    newData?: TRequestData
  ) => Promise<
    Omit<
      TypeUseWriterResponse<TRequestData, TResponseData>,
      "isLoading" | "writeData"
    >
  >;
};

export const useWriter = <TRequestData, TResponseData>({
  url,
  method = "POST",
  options,
}: TypeUseWriterRequest): TypeUseWriterResponse<
  TRequestData,
  TResponseData
> => {
  const [isResponseOk, setIsResponseOk] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HTTPStatusCode | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<TRequestData | null>(null);
  const [responseData, setResponseData] = useState<TResponseData | null>(null);
  const { authClient } = useAuth();

  async function writeData(newData?: TRequestData) {
    setIsLoading(true);
    setIsResponseOk(null);
    setError(null);
    if (newData) {
      setRequestData(newData);
    }
    let appAccessToken: string | null = null;
    const shoudUseBuiltInAuth = !options?.headers?.some(
      (el) => el[0] === HTTPHeader.AUTHORIZATION
    );

    if (shoudUseBuiltInAuth) {
      appAccessToken = await authClient.getAppAccessToken();
    }

    const uuid = window.crypto.randomUUID();
    const localResponse: Omit<
      TypeUseWriterResponse<TRequestData, TResponseData>,
      "isLoading" | "writeData"
    > = {
      isResponseOk: null,
      error: null,
      requestId: null,
      requestData: null,
      responseData: null,
    };

    return fetch(url, {
      body: JSON.stringify(newData),
      method,
      headers: shoudUseBuiltInAuth
        ? [
            [HTTPHeader.AUTHORIZATION, `Bearer ${appAccessToken}`],
            [HTTPHeader.CONTENT_TYPE, "application/json"],
            ...(options?.headers ?? []),
          ]
        : [...(options?.headers ?? [])],
      mode: "cors",
      cache: "default",
      ...(options?.fetchOptions ?? []),
    })
      .then((response) => {
        localResponse.isResponseOk = response.ok;
        localResponse.requestId = uuid;
        setIsResponseOk(response.ok);

        if (!response.ok) {
          localResponse.error = response.status;
          setError(response.status);
          options?.logger(response);
        }

        return response.json();
      })
      .then((dt) => {
        setResponseData(dt);

        return localResponse;
      })
      .catch((err: Error) => options?.logger(err))
      .finally(() => {
        setIsLoading(false);
        setRequestId(uuid);
      });
  }

  return {
    isResponseOk,
    isLoading,
    error,
    requestId, // used to track individual API requests
    requestData,
    responseData,
    writeData,
  };
};
