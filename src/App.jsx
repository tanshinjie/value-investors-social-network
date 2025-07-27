import React, { useMemo } from 'react';
import { Users, Network, TrendingUp, Globe, Building2 } from 'lucide-react';
import NetworkGraph from './components/NetworkGraph';
import StatCard from './components/StatCard';
import Legend from './components/Legend';
import { useCSVData } from './hooks/useCSVData';
import './App.css';
import nodesPath from './assets/GlobalValueInvestors-nodes.csv?url';
import edgesPath from './assets/GlobalValueInvestors-edges.csv?url';

function App() {
  const { nodes, edges, loading, error } = useCSVData(
    nodesPath,
    edgesPath
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!nodes || !edges) return {};

    const categoryCounts = nodes.reduce((acc, node) => {
      acc[node.Category] = (acc[node.Category] || 0) + 1;
      return acc;
    }, {});

    const geographyCounts = nodes.reduce((acc, node) => {
      acc[node.Geography] = (acc[node.Geography] || 0) + 1;
      return acc;
    }, {});

    const relationshipCounts = edges.reduce((acc, edge) => {
      acc[edge.Relationship] = (acc[edge.Relationship] || 0) + 1;
      return acc;
    }, {});

    const strongConnections = edges.filter(edge => edge.Strength === '3').length;

    return {
      totalInvestors: nodes.length,
      totalConnections: edges.length,
      strongConnections,
      categories: categoryCounts,
      geographies: geographyCounts,
      relationships: relationshipCounts,
      avgConnectionsPerInvestor: (edges.length * 2 / nodes.length).toFixed(1)
    };
  }, [nodes, edges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investor network data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading data:</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Header - Full Width */}
      <header className="col-span-12 chart-card fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="dashboard-title mb-2">Global Value Investors Network</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Interactive visualization of relationships among {stats.totalInvestors} prominent value investors
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Metrics Row */}
      <StatCard
        className="col-span-12 md:col-span-3 slide-up"
        title="Total Investors"
        value={stats.totalInvestors}
        description="Prominent value investors worldwide"
        icon={<Users className="w-5 h-5 text-primary" />}
      />
      
      <StatCard
        className="col-span-12 md:col-span-3 slide-up"
        title="Connections"
        value={stats.totalConnections}
        description="Professional relationships mapped"
        icon={<Network className="w-5 h-5 text-primary" />}
      />
      
      <StatCard
        className="col-span-12 md:col-span-3 slide-up"
        title="Strong Bonds"
        value={stats.strongConnections}
        description="Mentorship & partnership ties"
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
      />
      
      <StatCard
        className="col-span-12 md:col-span-3 slide-up"
        title="Avg Connections"
        value={stats.avgConnectionsPerInvestor}
        description="Per investor in the network"
        icon={<Globe className="w-5 h-5 text-primary" />}
      />

      {/* Main Network Visualization */}
      <div className="col-span-12 md:col-span-9 chart-card fade-in">
        <div className="mb-4">
          <h2 className="section-title">Network Visualization</h2>
          <p className="text-sm text-muted-foreground">
            Interactive force-directed graph showing investor relationships. Node size reflects connection count.
          </p>
        </div>
        <NetworkGraph 
          nodes={nodes} 
          edges={edges} 
          width={800} 
          height={600} 
        />
      </div>

      {/* Legend and Controls */}
      <div className="col-span-12 md:col-span-3 fade-in">
        <Legend categories={stats.categories} />
      </div>

      {/* Category Breakdown */}
      <div className="col-span-12 md:col-span-6 chart-card fade-in">
        <h3 className="section-title mb-4">Investor Categories</h3>
        <div className="space-y-3">
          {Object.entries(stats.categories).map(([category, count]) => {
            const percentage = ((count / stats.totalInvestors) * 100).toFixed(1);
            return (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="col-span-12 md:col-span-6 chart-card fade-in">
        <h3 className="section-title mb-4">Geographic Distribution</h3>
        <div className="space-y-3">
          {Object.entries(stats.geographies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([geography, count]) => {
              const percentage = ((count / stats.totalInvestors) * 100).toFixed(1);
              return (
                <div key={geography} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{geography}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Relationship Types */}
      <div className="col-span-12 chart-card fade-in">
        <h3 className="section-title mb-4">Relationship Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.relationships).map(([relationship, count]) => {
            const percentage = ((count / stats.totalConnections) * 100).toFixed(1);
            return (
              <div key={relationship} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">{count}</div>
                <div className="text-sm font-medium mb-1">{relationship}</div>
                <div className="text-xs text-muted-foreground">{percentage}% of connections</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="col-span-12 chart-card fade-in">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            This network visualization maps the professional relationships among prominent global value investors,
            highlighting the interconnected nature of the investment community.
          </p>
          <p>
            Data includes mentorship relationships, business partnerships, academic collaborations, and professional influences.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
