
import React from "react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { NodeTemplate } from "@/lib/nodeCategories";
import { X } from "lucide-react";

interface NodeInfoProps {
  node: Node | null;
  onClose: () => void;
  onUpdateNodeParams: (nodeId: string, params: Record<string, any>) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({ node, onClose, onUpdateNodeParams }) => {
  if (!node) return null;
  
  const template = node.data?.template as NodeTemplate | undefined;
  const params = node.data?.params || {};
  
  const handleParamChange = (key: string, value: any) => {
    // Create a new object explicitly to avoid spread type error
    const currentParams = node.data?.params || {};
    const newParams = Object.assign({}, currentParams, { [key]: value });
    onUpdateNodeParams(node.id, { params: newParams });
  };
  
  // Add default parameters based on node type if none exist
  const addDefaultParams = () => {
    let defaultParams = {};
    
    if (template) {
      switch (template.type) {
        case "linear":
          defaultParams = { in_features: 784, out_features: 128, bias: true };
          break;
        case "conv2d":
          defaultParams = { in_channels: 3, out_channels: 16, kernel_size: 3, stride: 1, padding: 0 };
          break;
        case "lstm":
          defaultParams = { input_size: 28, hidden_size: 64, num_layers: 1, batch_first: true };
          break;
        case "adam":
          defaultParams = { lr: 0.001, betas: [0.9, 0.999], eps: 1e-8, weight_decay: 0 };
          break;
        case "sgd":
          defaultParams = { lr: 0.01, momentum: 0.9, weight_decay: 0 };
          break;
        case "normalize":
          defaultParams = { mean: [0.5], std: [0.5] };
          break;
        case "resize":
          defaultParams = { size: [224, 224], mode: "bilinear" };
          break;
        case "dataLoader":
          defaultParams = { batch_size: 64, shuffle: true };
          break;
      }
      
      if (Object.keys(params).length === 0 && Object.keys(defaultParams).length > 0) {
        onUpdateNodeParams(node.id, { params: defaultParams });
      }
    }
  };
  
  // Add default parameters when the component mounts
  React.useEffect(() => {
    if (node && template?.configurable) {
      addDefaultParams();
    }
  }, [node?.id, template?.type]);
  
  const renderParamField = (key: string, value: any) => {
    if (typeof value === "boolean") {
      return (
        <div key={key} className="mb-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleParamChange(key, e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
            </span>
          </label>
        </div>
      );
    }
    
    if (typeof value === "number") {
      return (
        <div key={key} className="mb-3">
          <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-3">
          <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
          </label>
          <input
            type="text"
            value={value.join(", ")}
            onChange={(e) => handleParamChange(
              key, 
              e.target.value.split(",").map(item => {
                const trimmed = item.trim();
                return isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
              })
            )}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Enter values separated by commas</p>
        </div>
      );
    }
    
    return (
      <div key={key} className="mb-3">
        <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
          {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
        </label>
        <input
          type="text"
          value={String(value || "")}
          onChange={(e) => handleParamChange(key, e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    );
  };
  
  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Node Properties</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
          <X size={18} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={String(node.data?.label || "")}
            onChange={(e) => onUpdateNodeParams(node.id, { label: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
            {template?.label || node.type}
          </div>
        </div>
      </div>
      
      {template?.configurable && (
        <>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Parameters</h4>
          <div className="space-y-1">
            {Object.entries(params).map(([key, value]) => {
              if (key === "label") return null; // Skip label as we handle it separately
              return renderParamField(key, value);
            })}
          </div>
        </>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button size="sm" className="w-full" onClick={() => onClose()}>Apply Changes</Button>
      </div>
    </div>
  );
};

export default NodeInfo;
