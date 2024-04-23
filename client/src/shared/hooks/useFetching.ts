import { useState } from "react";

export const useFetching = (callback: () => Promise<any>): [Function, boolean, string] => {
  const [loaging, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetching: Function = async () => {
    try {
      setLoading(true);
      await callback();
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false);
    }
  }

  return [fetching, loaging, error];
}
