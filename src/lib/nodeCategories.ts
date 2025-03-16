
import { 
  Network, 
  BoxSelect, 
  Layers, 
  EyeIcon, 
  Wand2, 
  LineChart, 
  ArrowRightLeft, 
  Cog, 
  Cpu, 
  RefreshCw,
  Save,
  Image,
  BarChart3, 
  Workflow
} from "lucide-react";

export interface NodeTemplate {
  type: string;
  category: string;
  label: string;
  description: string;
  icon: typeof Network;
  color: string;
  inputs?: number;
  outputs?: number;
  configurable?: boolean;
}

export const categories = [
  { id: "input", label: "Input", color: "#E1EFFF" },
  { id: "layer", label: "Layers", color: "#F2F7FF" },
  { id: "activation", label: "Activation", color: "#FFEDE8" },
  { id: "optimizer", label: "Optimizers", color: "#F3F0FF" },
  { id: "transform", label: "Transforms", color: "#E7F9F9" },
  { id: "loss", label: "Loss Functions", color: "#FFF4E0" },
  { id: "operation", label: "Operations", color: "#F5F5F5" },
  { id: "output", label: "Output", color: "#F0F7FF" },
];

export const nodeTemplates: NodeTemplate[] = [
  // Input nodes
  {
    type: "dataLoader",
    category: "input",
    label: "Data Loader",
    description: "Load and batch data for training",
    icon: BoxSelect,
    color: "#E1EFFF",
    inputs: 0,
    outputs: 1,
    configurable: true
  },
  {
    type: "imageInput",
    category: "input",
    label: "Image Input",
    description: "Input for image data",
    icon: Image,
    color: "#E1EFFF",
    inputs: 0,
    outputs: 1,
    configurable: true
  },
  
  // Layer nodes
  {
    type: "linear",
    category: "layer",
    label: "Linear Layer",
    description: "Fully connected layer",
    icon: Layers,
    color: "#F2F7FF",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  {
    type: "conv2d",
    category: "layer",
    label: "Conv2D",
    description: "2D convolution layer",
    icon: Layers,
    color: "#F2F7FF",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  {
    type: "lstm",
    category: "layer",
    label: "LSTM",
    description: "Long Short-Term Memory layer",
    icon: Layers,
    color: "#F2F7FF",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  
  // Activation nodes
  {
    type: "relu",
    category: "activation",
    label: "ReLU",
    description: "Rectified Linear Unit activation",
    icon: Wand2,
    color: "#FFEDE8",
    inputs: 1,
    outputs: 1
  },
  {
    type: "sigmoid",
    category: "activation",
    label: "Sigmoid",
    description: "Sigmoid activation function",
    icon: Wand2,
    color: "#FFEDE8",
    inputs: 1,
    outputs: 1
  },
  {
    type: "tanh",
    category: "activation",
    label: "Tanh",
    description: "Hyperbolic tangent activation",
    icon: Wand2,
    color: "#FFEDE8",
    inputs: 1,
    outputs: 1
  },
  
  // Optimizer nodes
  {
    type: "adam",
    category: "optimizer",
    label: "Adam",
    description: "Adam optimizer",
    icon: RefreshCw,
    color: "#F3F0FF",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  {
    type: "sgd",
    category: "optimizer",
    label: "SGD",
    description: "Stochastic Gradient Descent",
    icon: RefreshCw,
    color: "#F3F0FF",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  
  // Transform nodes
  {
    type: "normalize",
    category: "transform",
    label: "Normalize",
    description: "Normalize input data",
    icon: ArrowRightLeft,
    color: "#E7F9F9",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  {
    type: "resize",
    category: "transform",
    label: "Resize",
    description: "Resize input dimensions",
    icon: ArrowRightLeft,
    color: "#E7F9F9",
    inputs: 1,
    outputs: 1,
    configurable: true
  },
  
  // Loss nodes
  {
    type: "crossEntropy",
    category: "loss",
    label: "Cross Entropy",
    description: "Cross entropy loss function",
    icon: LineChart,
    color: "#FFF4E0",
    inputs: 2,
    outputs: 1
  },
  {
    type: "mse",
    category: "loss",
    label: "MSE",
    description: "Mean squared error loss",
    icon: LineChart,
    color: "#FFF4E0",
    inputs: 2,
    outputs: 1
  },
  
  // Operation nodes
  {
    type: "concat",
    category: "operation",
    label: "Concatenate",
    description: "Concatenate multiple inputs",
    icon: Workflow,
    color: "#F5F5F5",
    inputs: 2,
    outputs: 1
  },
  {
    type: "split",
    category: "operation",
    label: "Split",
    description: "Split input into multiple outputs",
    icon: Workflow,
    color: "#F5F5F5",
    inputs: 1,
    outputs: 2
  },
  
  // Output nodes
  {
    type: "model",
    category: "output",
    label: "Model",
    description: "Final model output",
    icon: Cpu,
    color: "#F0F7FF",
    inputs: 1,
    outputs: 0,
    configurable: true
  },
  {
    type: "visualize",
    category: "output",
    label: "Visualize",
    description: "Visualize model performance",
    icon: BarChart3,
    color: "#F0F7FF",
    inputs: 1,
    outputs: 0
  },
  {
    type: "export",
    category: "output",
    label: "Export",
    description: "Export trained model",
    icon: Save,
    color: "#F0F7FF",
    inputs: 1,
    outputs: 0,
    configurable: true
  }
];

export function getNodeTemplate(type: string): NodeTemplate | undefined {
  return nodeTemplates.find(template => template.type === type);
}

export function getCategoryNodes(categoryId: string): NodeTemplate[] {
  return nodeTemplates.filter(node => node.category === categoryId);
}
