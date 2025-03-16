
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Play, Download, Trash2, Undo, Redo, FileDown, FileUp } from "lucide-react";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";
import { generatePyTorchCode } from "@/lib/codeGenerator";

interface HeaderProps {
  onRun: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onRun,
  onClear,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const { getNodes, getEdges } = useReactFlow();
  
  const handleRun = () => {
    onRun();
    toast.success("Running model...");
  };
  
  const handleExport = () => {
    const nodes = getNodes();
    const edges = getEdges();
    
    try {
      // Generate the PyTorch code
      const pythonCode = generatePyTorchCode(nodes, edges);
      
      // Create a blob for downloading
      const blob = new Blob([pythonCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pytorch_model.py';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("PyTorch code exported successfully");
    } catch (error) {
      console.error("Error exporting PyTorch code:", error);
      toast.error("Failed to export PyTorch code");
    }
  };

  return (
    <header className="w-full h-14 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-4 flex items-center">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold mr-2">
            P
          </div>
          <h1 className="text-lg font-semibold">PyTorch Flow</h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUndo} 
            disabled={!canUndo}
            className="text-gray-700 h-8"
          >
            <Undo size={16} className="mr-1" />
            <span className="text-xs">Undo</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRedo} 
            disabled={!canRedo}
            className="text-gray-700 h-8"
          >
            <Redo size={16} className="mr-1" />
            <span className="text-xs">Redo</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSave}
          className="text-gray-700 border-gray-200 h-8"
        >
          <Save size={16} className="mr-1" />
          <span className="text-xs">Save</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLoad}
          className="text-gray-700 border-gray-200 h-8"
        >
          <FileUp size={16} className="mr-1" />
          <span className="text-xs">Load</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-8"
        >
          <Trash2 size={16} className="mr-1" />
          <span className="text-xs">Clear</span>
        </Button>
        
        <Button
          size="sm"
          onClick={handleRun}
          className="bg-blue-600 hover:bg-blue-700 h-8"
        >
          <Play size={16} className="mr-1" />
          <span className="text-xs">Run</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white border-green-500 h-8"
        >
          <Download size={16} className="mr-1" />
          <span className="text-xs">Export</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
