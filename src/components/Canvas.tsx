import React, { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./NodeTypes";
import { initialNodes, initialEdges } from "@/lib/initialNodes";
import { getNodeTemplate } from "@/lib/nodeCategories";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NodeInfo from "./NodeInfo";

let id = 0;
const getId = () => `node_${id++}`;

const Canvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [undoStack, setUndoStack] = useState<Array<{nodes: Node[]; edges: Edge[]}>>([]);
  const [redoStack, setRedoStack] = useState<Array<{nodes: Node[]; edges: Edge[]}>>([]);
  const { project, getIntersectingNodes } = useReactFlow();

  // Keep track of history for undo/redo
  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setUndoStack(prev => [...prev, { nodes, edges }]);
    setRedoStack([]);
  }, [nodes, edges]);

  // Save current state when nodes or edges change
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      // Don't save if this is an initial load
      if (undoStack.length > 0 || redoStack.length > 0) {
        saveToHistory(nodes, edges);
      }
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, saveToHistory]);

  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory(nodes, edges);
      const newEdge = { ...params, animated: true, style: { stroke: "#9ca3af" } };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success("Connected nodes");
    },
    [edges, nodes, saveToHistory, setEdges]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      saveToHistory(nodes, edges);
      setEdges(
        edges.filter(
          (edge) =>
            !deleted.some(
              (node) => edge.source === node.id || edge.target === node.id
            )
        )
      );
      
      // If the selected node is being deleted, clear the selection
      if (selectedNode && deleted.some(node => node.id === selectedNode.id)) {
        setSelectedNode(null);
      }
      
      toast.info("Node deleted");
    },
    [edges, nodes, saveToHistory, selectedNode, setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow/type");
      const nodeData = JSON.parse(event.dataTransfer.getData("application/reactflow/data"));
      
      // Check if the dropped element is valid
      if (!type || !nodeData) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNodeId = getId();
      const newNode = {
        id: newNodeId,
        type,
        position,
        data: {
          label: nodeData.label,
          template: nodeData.template,
          params: {}
        },
      };

      saveToHistory(nodes, edges);
      setNodes((nds) => nds.concat(newNode));
      
      toast.success(`Added ${nodeData.label} node`);
    },
    [reactFlowInstance, nodes, edges, saveToHistory, setNodes]
  );

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeData: any
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/data", JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = "move";
    
    // Create a drag preview
    const preview = document.createElement("div");
    preview.className = "dnd-preview";
    preview.textContent = nodeData.label;
    document.body.appendChild(preview);
    
    const updatePreview = (e: MouseEvent) => {
      preview.style.left = `${e.pageX}px`;
      preview.style.top = `${e.pageY}px`;
    };
    
    document.addEventListener("mousemove", updatePreview);
    
    // Cleanup on drag end
    event.currentTarget.addEventListener(
      "dragend",
      () => {
        document.removeEventListener("mousemove", updatePreview);
        preview.remove();
      },
      { once: true }
    );
  };
  
  const onUpdateNodeParams = useCallback(
    (nodeId: string, updates: Record<string, any>) => {
      saveToHistory(nodes, edges);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
      toast.success("Node updated");
    },
    [nodes, edges, saveToHistory, setNodes]
  );
  
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const current = { nodes, edges };
    const previous = undoStack[undoStack.length - 1];
    
    setRedoStack(prev => [...prev, current]);
    setUndoStack(prev => prev.slice(0, -1));
    
    setNodes(previous.nodes);
    setEdges(previous.edges);
    
    // Update selected node if needed
    if (selectedNode) {
      const nodeStillExists = previous.nodes.find(n => n.id === selectedNode.id);
      if (!nodeStillExists) {
        setSelectedNode(null);
      }
    }
    
    toast.info("Undo successful");
  }, [undoStack, redoStack, nodes, edges, selectedNode, setNodes, setEdges]);
  
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const current = { nodes, edges };
    const next = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, current]);
    setRedoStack(prev => prev.slice(0, -1));
    
    setNodes(next.nodes);
    setEdges(next.edges);
    
    toast.info("Redo successful");
  }, [undoStack, redoStack, nodes, edges, setNodes, setEdges]);
  
  const handleClear = useCallback(() => {
    saveToHistory(nodes, edges);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast.info("Canvas cleared");
  }, [nodes, edges, saveToHistory, setNodes, setEdges]);
  
  const handleSave = useCallback(() => {
    try {
      const flow = {
        nodes,
        edges,
      };
      const json = JSON.stringify(flow);
      localStorage.setItem("pytorch-flow", json);
      toast.success("Flow saved successfully");
    } catch (error) {
      console.error("Error saving flow:", error);
      toast.error("Failed to save flow");
    }
  }, [nodes, edges]);
  
  const handleLoad = useCallback(() => {
    try {
      const json = localStorage.getItem("pytorch-flow");
      if (json) {
        const flow = JSON.parse(json);
        saveToHistory(nodes, edges);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        toast.success("Flow loaded successfully");
      } else {
        toast.info("No saved flow found");
      }
    } catch (error) {
      console.error("Error loading flow:", error);
      toast.error("Failed to load flow");
    }
  }, [nodes, edges, saveToHistory, setNodes, setEdges]);
  
  const handleRun = useCallback(() => {
    // This would be replaced with actual PyTorch functionality in a real implementation
    toast.success("Model training started");
    
    setTimeout(() => {
      toast.success("Model trained successfully", {
        description: "Accuracy: 92.3% | Loss: 0.087",
      });
    }, 3000);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <Header 
        onRun={handleRun}
        onClear={handleClear}
        onSave={handleSave}
        onLoad={handleLoad}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onDragStart={onDragStart} />
        
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "#9ca3af", strokeWidth: 2 }
            }}
          >
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              style={{
                width: 150,
                height: 100,
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} className="bg-gray-50" />
            <Panel position="bottom-center">
              <div className="glassmorphism px-3 py-1.5 text-xs text-gray-500 rounded-full animate-fadeIn">
                Drag nodes from the sidebar • Connect nodes by dragging between handles
              </div>
            </Panel>
          </ReactFlow>
        </div>
        
        {selectedNode && (
          <NodeInfo 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onUpdateNodeParams={onUpdateNodeParams}
          />
        )}
      </div>
    </div>
  );
};

export default Canvas;
