
import React, { useState } from "react";
import { categories, getCategoryNodes, NodeTemplate } from "@/lib/nodeCategories";
import { Search, ChevronRight, ChevronDown } from "lucide-react";

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => ({ ...acc, [category.id]: true }), {})
  );
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const filteredCategories = categories.filter(category => {
    const categoryNodes = getCategoryNodes(category.id);
    return categoryNodes.some(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const renderNodeItem = (node: NodeTemplate) => {
    const isVisible = 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!isVisible) return null;
    
    return (
      <div
        key={node.type}
        className="sidebar-node group"
        draggable
        onDragStart={(event) => onDragStart(event, node.type, { 
          label: node.label,
          template: node
        })}
        title={node.description}
      >
        <div 
          className="sidebar-node-icon"
          style={{ backgroundColor: node.color }}
        >
          {React.createElement(node.icon, { 
            size: 16, 
            className: "text-gray-700" 
          })}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{node.label}</span>
          <span className="text-xs text-gray-500 truncate">{node.description}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 px-3 py-4 flex flex-col overflow-hidden">
      <h2 className="text-lg font-semibold mb-3 px-2">Components</h2>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search components..."
          className="w-full pl-8 pr-2 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center text-left py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {expandedCategories[category.id] ? 
                <ChevronDown size={16} className="mr-1 text-gray-500" /> : 
                <ChevronRight size={16} className="mr-1 text-gray-500" />
              }
              <span className="text-sm font-medium">{category.label}</span>
            </button>
            
            {expandedCategories[category.id] && (
              <div className="ml-2">
                {getCategoryNodes(category.id).map(renderNodeItem)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-2 border-t border-gray-200 mt-2">
        <div className="text-xs text-gray-500 px-2">
          Drag components onto the canvas to build your model
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
