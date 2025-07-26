import { useState, useEffect } from 'react';
import * as d3 from 'd3';

export const useCSVData = (nodesPath, edgesPath) => {
  const [data, setData] = useState({
    nodes: [],
    edges: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const [nodesData, edgesData] = await Promise.all([
          d3.csv(nodesPath),
          d3.csv(edgesPath)
        ]);

        setData({
          nodes: nodesData,
          edges: edgesData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    if (nodesPath && edgesPath) {
      loadData();
    }
  }, [nodesPath, edgesPath]);

  return data;
};

