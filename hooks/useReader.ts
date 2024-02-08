import { useEffect, useState } from "react";
import { HTTPHeader, HTTPStatusCode } from "../defs/enums";
import { useAtom } from "./useAtom";
import { Auth } from "../defs/types";
import { AUTH_STATE_NAME } from "../defs/const";

const handleAuthToken = async (
  setAtom: (key: "token", value: any) => Promise<void>
) => {
  // TODO: Handle authentification token so it doesn't have to be provided on each request
};

type TypeUseReaderRequest<TResponseData> = {
  url: string;
  isSuspended?: boolean;
  initialValue?: TResponseData | null;
  deps?: Array<unknown>;
  options?: {
    headers?: [keyof HTTPHeader, string][];
    fetchOptions?: Partial<Omit<RequestInit, "body">>;
    logger: (obj: any) => void;
  };
};

export type TypeUseReaderResponse<TResponseData> = {
  data: TResponseData | null;
  isLoading: boolean;
  error: HTTPStatusCode | null;
  readData: (newUrl?: string) => Promise<void>;
};

export const useReader = <TResponseData>({
  url,
  isSuspended,
  initialValue,
  deps,
  options,
}: TypeUseReaderRequest<TResponseData>): TypeUseReaderResponse<TResponseData> => {
  const [data, setData] = useState<TResponseData | null>(initialValue ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HTTPStatusCode | null>(null);
  const { atom, setAtom } = useAtom<Auth>(AUTH_STATE_NAME);

  async function readData(newUrl?: string) {
    setIsLoading(true);
    const currentUrl = newUrl ?? url;
    const shoudUseBuiltInAuth = !options?.headers?.some(
      (el) => el[0] === "authorization"
    );

    fetch(currentUrl, {
      headers: shoudUseBuiltInAuth
        ? [
            ["authorization", `Bearer ${atom.token}`],
            ...(options?.headers ?? []),
          ]
        : [...(options?.headers ?? [])],
      mode: "cors",
      cache: "default",
      ...(options?.fetchOptions ?? []),
    })
      .then((response) => {
        if (!response.ok) {
          setError(response.status);
          options?.logger(response);
        }

        handleAuthToken(setAtom);
        return response.json();
      })
      .then((dt) => {
        setData(dt);
      })
      .catch((err: Error) => {
        options?.logger(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (!isSuspended) {
      readData();
    }
  }, [isSuspended, url, ...(deps ?? [])]);

  return {
    data,
    isLoading,
    error,
    readData,
  };
};
