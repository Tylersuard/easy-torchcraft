
import { Edge, Node, Position } from "@xyflow/react";
import { getNodeTemplate } from "./nodeCategories";

export const initialNodes: Node[] = [
  {
    id: "dataloader1",
    type: "dataLoader",
    position: { x: 100, y: 150 },
    data: {
      label: "CIFAR-10 Dataset",
      template: getNodeTemplate("dataLoader"),
      params: {
        batchSize: 32,
        shuffle: true
      }
    }
  },
  {
    id: "transform1",
    type: "normalize",
    position: { x: 350, y: 150 },
    data: {
      label: "Normalize",
      template: getNodeTemplate("normalize"),
      params: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225]
      }
    }
  },
  {
    id: "conv1",
    type: "conv2d",
    position: { x: 600, y: 150 },
    data: {
      label: "Conv2D",
      template: getNodeTemplate("conv2d"),
      params: {
        inChannels: 3,
        outChannels: 64,
        kernelSize: 3,
        stride: 1,
        padding: 1
      }
    }
  },
  {
    id: "relu1",
    type: "relu",
    position: { x: 850, y: 150 },
    data: {
      label: "ReLU",
      template: getNodeTemplate("relu")
    }
  },
  {
    id: "model1",
    type: "model",
    position: { x: 1100, y: 250 },
    data: {
      label: "CNN Model",
      template: getNodeTemplate("model"),
      params: {
        name: "SimpleCNN",
        inputSize: [3, 32, 32]
      }
    }
  }
];

export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "dataloader1",
    target: "transform1",
    animated: true,
    style: { stroke: "#9ca3af" }
  },
  {
    id: "e2-3",
    source: "transform1",
    target: "conv1",
    animated: true,
    style: { stroke: "#9ca3af" }
  },
  {
    id: "e3-4",
    source: "conv1",
    target: "relu1",
    animated: true,
    style: { stroke: "#9ca3af" }
  },
  {
    id: "e4-5",
    source: "relu1",
    target: "model1",
    animated: true,
    style: { stroke: "#9ca3af" }
  }
];
