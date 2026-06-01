import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 0,
    pageSize = 20,
    threshold = 300, // Distance from bottom to trigger load
    dependencies = [], // Dependencies to trigger reset
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);

  // Helper to check if we're currently fetching
  const isFetchingRef = useRef(false);

  // Fetch data
  const fetchData = useCallback(async (pageNum, isReset = false) => {
    if (isFetchingRef.current || (!hasMore && !isReset)) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction({
        page: pageNum,
        size: pageSize,
      });

      const newData = response.content || [];
      const isLastPage = response.last || response.totalPages === pageNum + 1;

      setData((prev) => (isReset ? newData : [...prev, ...newData]));
      setHasMore(!isLastPage && newData.length > 0);
      setPage(pageNum);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchFunction, pageSize, hasMore]);

  // Initial load & dependencies reset
  useEffect(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    fetchData(initialPage, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      fetchData(page + 1);
    }
  }, [hasMore, page, threshold, fetchData]);

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
    fetchData(initialPage, true);
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