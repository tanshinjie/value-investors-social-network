import React from 'react';
import '../App.css';

const Legend = ({ categories }) => {
  const categoryColors = {
    'Academic Lineage': '#3b82f6',
    'Graham-Dodd Disciples': '#10b981',
    'Modern Fund Managers': '#8b5cf6',
    'Global Value Investors': '#f59e0b',
    'Philanthropy/Other': '#ef4444',
    'Other': '#6b7280'
  };

  const relationshipTypes = [
    { type: 'Mentor of', strength: 3, description: 'Strong mentorship relationship' },
    { type: 'Partner of', strength: 3, description: 'Business partnership' },
    { type: 'Colleague at', strength: 2, description: 'Professional colleagues' },
    { type: 'Influenced', strength: 1, description: 'Intellectual influence' }
  ];

  return (
    <div className="chart-card">
      <h3 className="section-title mb-4">Legend</h3>
      
      <div className="space-y-6">
        {/* Node Categories */}
        <div>
          <h4 className="font-medium text-sm mb-3 text-muted-foreground">Investor Categories</h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(categoryColors).map(([category, color]) => {
              const count = categories[category] || 0;
              return (
                <div key={category} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm flex-1">{category}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Relationship Types */}
        <div>
          <h4 className="font-medium text-sm mb-3 text-muted-foreground">Relationship Strength</h4>
          <div className="space-y-2">
            {relationshipTypes.map(({ type, strength, description }) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-muted-foreground" style={{ height: `${strength}px` }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{type}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">Interactions</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Hover over nodes to see connections</p>
            <p>• Click nodes for detailed information</p>
            <p>• Drag nodes to reposition</p>
            <p>• Zoom and pan to explore</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;

