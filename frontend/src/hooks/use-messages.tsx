/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { IMessage } from "@/types";
import { useEffect, useState } from "react";

export interface Item {
  key: number;
  value: string;
}

interface Response {
  canLoadMore: boolean;
  data: any[];
}

async function loadItems(
  timestamp: string | null,
  groupId: string
): Promise<Response> {
  const response = await api.post(
    `/groups/${groupId}/messages`,
    timestamp
      ? {
          cursor: timestamp,
        }
      : { page: 1 }
  );

  return {
    canLoadMore: response?.data?.canLoadMore,
    data: response?.data?.messages,
  };
}

export function useMessages(groupId: string, initialMessages: any[] = []) {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<IMessage[]>(initialMessages);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  useEffect(() => {
    if (!groupId) return;
    setItems([]);
    setCanLoadMore(true);
  }, [groupId]);

  async function loadMore() {
    if (!canLoadMore || loading) return;
    setLoading(true);
    try {
      const lastTimestamp =
        items?.length > 0 ? items[items?.length-1].createdAt : null;
      const { data, canLoadMore: moreAvailable } = await loadItems(
        lastTimestamp,
        groupId
      );
      setItems((current) => [...current, ...data]);
      setCanLoadMore(moreAvailable);
    } catch (error) {
      setError(error);
      setCanLoadMore(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return { loading, items, canLoadMore, error, loadMore, setItems };
}
