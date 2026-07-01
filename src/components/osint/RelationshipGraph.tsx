import { useMemo, useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface RelationshipGraphProps {
  evidence: any;
  targetType: string;
  targetValue: string;
}

export function RelationshipGraph({ evidence, targetType, targetValue }: RelationshipGraphProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [
      {
        id: 'target',
        position: { x: 250, y: 50 },
        data: { label: `${targetType.toUpperCase()}: ${targetValue}` },
        style: { background: '#f87171', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }
      }
    ];
    const initialEdges: Edge[] = [];

    let yOffset = 150;
    let xOffset = 50;

    Object.entries(evidence).forEach(([key, data]: [string, any]) => {
      if (key !== targetType) {
        const nodeId = `node-${key}`;
        let label = key.toUpperCase();
        
        // Extract a meaningful label based on the evidence type
        if (key === 'domain' && data.domain) label += `: ${data.domain}`;
        if (key === 'company' && data.company_name) label += `: ${data.company_name}`;
        if (key === 'ip' && data.ip_address) label += `: ${data.ip_address}`;
        if (key === 'username' && data.username) label += `: ${data.username}`;
        
        initialNodes.push({
          id: nodeId,
          position: { x: xOffset, y: yOffset },
          data: { label },
          style: { background: '#60a5fa', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }
        });
        
        initialEdges.push({
          id: `e-target-${nodeId}`,
          source: 'target',
          target: nodeId,
          animated: true,
          style: { stroke: '#94a3b8' }
        });
        
        xOffset += 200;
        if (xOffset > 450) {
          xOffset = 50;
          yOffset += 100;
        }
      }
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [evidence, targetType, targetValue]);

  if (!isMounted) {
    return <div style={{ height: '400px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Graph...</div>;
  }

  return (
    <div style={{ height: '400px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
