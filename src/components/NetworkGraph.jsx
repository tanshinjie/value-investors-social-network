import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../App.css';

const NetworkGraph = ({ nodes, edges, width = 800, height = 600 }) => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!nodes || !edges || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Process data
    const nodeMap = new Map(nodes.map(d => [d.ID, { ...d, id: d.ID }]));
    const processedEdges = edges
      .filter(d => nodeMap.has(d.Source) && nodeMap.has(d.Target))
      .map(d => ({
        source: d.Source,
        target: d.Target,
        relationship: d.Relationship,
        strength: +d.Strength
      }));

    const processedNodes = Array.from(nodeMap.values());

    // Create color scale for categories
    const categoryColors = {
      'Academic Lineage': '#3b82f6',
      'Graham-Dodd Disciples': '#10b981',
      'Modern Fund Managers': '#8b5cf6',
      'Global Value Investors': '#f59e0b',
      'Philanthropy/Other': '#ef4444',
      'Other': '#6b7280'
    };

    // Create gradients for nodes
    const defs = svg.append("defs");
    
    Object.entries(categoryColors).forEach(([category, color]) => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${category.replace(/[^a-zA-Z]/g, '')}`)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(color).brighter(0.3))
        .attr("stop-opacity", 1);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1);
    });

    // Create force simulation
    const simulation = d3.forceSimulation(processedNodes)
      .force("link", d3.forceLink(processedEdges)
        .id(d => d.id)
        .distance(d => 50 + (4 - d.strength) * 20)
        .strength(d => d.strength * 0.3))
      .force("charge", d3.forceManyBody()
        .strength(-300)
        .distanceMax(200))
      .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force("collision", d3.forceCollide().radius(15));

    // Create edges
    const link = g.append("g")
      .attr("class", "edges")
      .selectAll("line")
      .data(processedEdges)
      .enter().append("line")
      .attr("class", d => `edge strength-${d.strength}`)
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", d => d.strength);

    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(processedNodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", d => {
        // Size based on connections
        const connections = processedEdges.filter(e => 
          e.source === d.id || e.target === d.id
        ).length;
        return Math.max(5, Math.min(15, 5 + connections * 0.8));
      })
      .style("fill", d => `url(#gradient-${d.Category.replace(/[^a-zA-Z]/g, '')})`)
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", function(event, d) {
        // Highlight connected nodes and edges
        const connectedEdges = processedEdges.filter(e => 
          e.source.id === d.id || e.target.id === d.id
        );
        const connectedNodeIds = new Set();
        connectedEdges.forEach(e => {
          connectedNodeIds.add(e.source.id);
          connectedNodeIds.add(e.target.id);
        });

        // Fade out non-connected elements
        node.style("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.3);
        link.style("opacity", e => 
          (e.source.id === d.id || e.target.id === d.id) ? 1 : 0.1
        );

        // Show tooltip
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <strong>${d.Label}</strong><br/>
            ${d['Primary Firm'] ? `${d['Primary Firm']}<br/>` : ''}
            ${d.Role}<br/>
            <em>${d.Category}</em><br/>
            ${d.Geography}
          `
        });
      })
      .on("mouseout", function() {
        // Reset opacity
        node.style("opacity", 1);
        link.style("opacity", 0.6);
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      })
      .on("click", function(event, d) {
        setSelectedNode(d);
      });

    // Add labels for important nodes
    const labels = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(processedNodes.filter(d => {
        const connections = processedEdges.filter(e => 
          e.source === d.id || e.target === d.id
        ).length;
        return connections > 3 || d.Label === 'Warren Buffett' || d.Label === 'Benjamin Graham';
      }))
      .enter().append("text")
      .attr("class", "node-label visible")
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(d => d.Label.split(' ').slice(-1)[0]); // Show last name

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y - 20);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [nodes, edges, width, height]);

  return (
    <div className="network-container">
      <svg
        ref={svgRef}
        className="network-svg"
        width={width}
        height={height}
        style={{ border: '1px solid var(--border)' }}
      />
      
      {tooltip.visible && (
        <div 
          className="tooltip visible"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {selectedNode && (
        <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm">
          <h3 className="font-semibold text-lg mb-2">{selectedNode.Label}</h3>
          <div className="space-y-1 text-sm">
            {selectedNode['Primary Firm'] && (
              <p><span className="font-medium">Firm:</span> {selectedNode['Primary Firm']}</p>
            )}
            <p><span className="font-medium">Role:</span> {selectedNode.Role}</p>
            <p><span className="font-medium">Category:</span> {selectedNode.Category}</p>
            <p><span className="font-medium">Geography:</span> {selectedNode.Geography}</p>
          </div>
          <button 
            onClick={() => setSelectedNode(null)}
            className="mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;

