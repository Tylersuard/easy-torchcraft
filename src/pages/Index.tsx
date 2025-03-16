
import React, { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "@/components/Canvas";

const Index = () => {
  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
