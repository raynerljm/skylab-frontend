/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiServiceBuilder } from "@/helpers/api";
import { HTTP_METHOD } from "@/types/api";
import { CALL_STATUS } from "./useApiCall.types";
import { useState } from "react";

/**
 * A custom wrapper hook to make API requests while providing state.
 * @param {HTTP_METHOD} param0.method the HTTP method to invoke.
 * @param {string} param0.endpoint the endpoint of where to make the request to (the apiservicebuilder automatically prepends the backend api url).
 * @param {{key: string}: any} param0.body the body of the request.
 * @param {boolean} param0.requiresAuthorization whether the endpoint requires the user to be authorized.
 * @returns an object where status is the status of the request, error is any encountered error (if any), call is the function to actually make the api request.

 */
const useApiCall = ({
  method = HTTP_METHOD.POST,
  endpoint = "",
  body = {},
  requiresAuthorization = true,
  onSuccess,
}: {
  method?: HTTP_METHOD;
  endpoint: string;
  body?: { [key: string]: any };
  requiresAuthorization?: boolean;
  onSuccess: <T>(data: T) => void;
}) => {
  const token = "placeholderToken"; // TODO: Retrieve from useAuth
  const [status, setStatus] = useState<CALL_STATUS>(CALL_STATUS.IDLE);
  const [error, setError] = useState("");

  /* Building API service. */
  const apiServiceBuilder = new ApiServiceBuilder({ method, endpoint, body });
  if (requiresAuthorization) {
    apiServiceBuilder.setToken(token);
  }
  const apiService = apiServiceBuilder.build();

  /* Calls the actual API call with the specified api service. */
  async function call() {
    setStatus(CALL_STATUS.LOADING);

    try {
      if (requiresAuthorization && !token) {
        throw new Error("User is unauthorized");
      }

      const res = await apiService();

      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      if (onSuccess) {
        const data = await res.json();
        onSuccess(data);
      }

      setStatus(CALL_STATUS.SUCCESS);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : (error as string));
      setStatus(CALL_STATUS.ERROR);
    }
  }

  return { status, error, call };
};

export default useApiCall;
