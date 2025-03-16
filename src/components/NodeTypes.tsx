
import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NodeTemplate } from "@/lib/nodeCategories";
import { Cog } from "lucide-react";

// Define the data structure for PyTorch nodes
export interface PyTorchNodeData {
  label: string;
  template: NodeTemplate | undefined;
  params?: Record<string, any>;
}

const PyTorchNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const nodeData = data as PyTorchNodeData;
  const { label, template } = nodeData;
  const inputCount = template?.inputs || 0;
  const outputCount = template?.outputs || 0;
  
  const getInputPositions = () => {
    const positions = [];
    if (inputCount === 1) {
      positions.push(0.5); // Center
    } else if (inputCount === 2) {
      positions.push(0.3, 0.7); // Two points
    } else {
      for (let i = 0; i < inputCount; i++) {
        positions.push((i + 1) / (inputCount + 1));
      }
    }
    return positions;
  };
  
  const getOutputPositions = () => {
    const positions = [];
    if (outputCount === 1) {
      positions.push(0.5); // Center
    } else if (outputCount === 2) {
      positions.push(0.3, 0.7); // Two points
    } else {
      for (let i = 0; i < outputCount; i++) {
        positions.push((i + 1) / (outputCount + 1));
      }
    }
    return positions;
  };
  
  const inputPositions = getInputPositions();
  const outputPositions = getOutputPositions();
  
  return (
    <div 
      className={`node-card relative transition-all duration-200 ${selected ? "scale-105" : ""}`}
      style={{ 
        backgroundColor: template?.color || "#ffffff",
        borderColor: selected ? "rgba(59, 130, 246, 0.5)" : "rgba(229, 231, 235, 1)",
      }}
    >
      {/* Input Handles */}
      {inputPositions.map((pos, idx) => (
        <Handle
          key={`input-${idx}`}
          id={`input-${idx}`}
          type="target"
          position={Position.Left}
          style={{ top: `${pos * 100}%` }}
          className="!transition-all !duration-200 !ease-in-out"
        />
      ))}
      
      {/* Header with Icon */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-100">
        {template?.icon && (
          <div 
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ backgroundColor: `${template.color}` }}
          >
            {React.createElement(template.icon, { 
              size: 16, 
              className: "text-gray-700"
            })}
          </div>
        )}
        <div className="font-medium text-sm truncate">{label}</div>
        
        {/* Settings Icon for configurable nodes */}
        {template?.configurable && (
          <div className="ml-auto">
            <Cog size={14} className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors" />
          </div>
        )}
      </div>
      
      {/* Node Content */}
      <div className="p-2 text-xs text-gray-500">
        {template?.description || "PyTorch Node"}
      </div>
      
      {/* Output Handles */}
      {outputPositions.map((pos, idx) => (
        <Handle
          key={`output-${idx}`}
          id={`output-${idx}`}
          type="source"
          position={Position.Right}
          style={{ top: `${pos * 100}%` }}
          className="!transition-all !duration-200 !ease-in-out"
        />
      ))}
    </div>
  );
});

// Define a mapping of node types to components
export const nodeTypes = {
  // Use PyTorchNode as the default for all node types
  dataLoader: PyTorchNode,
  imageInput: PyTorchNode,
  linear: PyTorchNode,
  conv2d: PyTorchNode,
  lstm: PyTorchNode,
  relu: PyTorchNode,
  sigmoid: PyTorchNode,
  tanh: PyTorchNode,
  adam: PyTorchNode,
  sgd: PyTorchNode,
  normalize: PyTorchNode,
  resize: PyTorchNode,
  crossEntropy: PyTorchNode,
  mse: PyTorchNode,
  concat: PyTorchNode,
  split: PyTorchNode,
  model: PyTorchNode,
  visualize: PyTorchNode,
  export: PyTorchNode
};

export default PyTorchNode;
