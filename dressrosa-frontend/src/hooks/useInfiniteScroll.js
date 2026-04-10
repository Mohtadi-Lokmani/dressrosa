import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 0,
    pageSize = 20,
    threshold = 300, // Distance from bottom to trigger load
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);

  // Fetch data
  const fetchData = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction({
        page: pageNum,
        size: pageSize,
      });

      const newData = response.content || [];
      const isLastPage = response.last || response.totalPages === pageNum + 1;

      setData((prev) => (pageNum === 0 ? newData : [...prev, ...newData]));
      setHasMore(!isLastPage && newData.length > 0);
      setPage(pageNum);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize, loading, hasMore]);

  // Initial load
  useEffect(() => {
    fetchData(initialPage);
  }, []);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      fetchData(page + 1);
    }
  }, [loading, hasMore, page, threshold, fetchData]);

  // Attach scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Refresh function
  const refresh = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    fetchData(initialPage);
  }, [fetchData, initialPage]);

  return {
    data,
    loading,
    hasMore,
    error,
    refresh,
    observerRef,
  };
};

export default useInfiniteScroll;