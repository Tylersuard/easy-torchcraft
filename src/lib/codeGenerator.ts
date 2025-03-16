
import { Node, Edge } from "@xyflow/react";
import { PyTorchNodeData } from "@/components/NodeTypes";
import { getNodeTemplate } from "@/lib/nodeCategories";

// Type guard to check if data is PyTorchNodeData
const isPyTorchNodeData = (data: any): data is PyTorchNodeData => {
  return data && typeof data.label === 'string' && data.template !== undefined;
};

// Safely convert node.data to PyTorchNodeData
const getNodeData = (node: Node): PyTorchNodeData => {
  if (isPyTorchNodeData(node.data)) {
    return node.data;
  }
  // If the data doesn't match PyTorchNodeData, return a default structure
  return {
    label: node.id || "Unknown Node",
    template: undefined,
    params: {}
  };
};

// Helper to get a unique list of nodes that are inputs to the graph (no incoming edges)
const getInputNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodesWithIncomingEdges = new Set(
    edges.map((edge) => edge.target)
  );
  
  return nodes.filter((node) => !nodesWithIncomingEdges.has(node.id));
};

// Helper to get children of a node
const getChildNodes = (nodeId: string, edges: Edge[]): string[] => {
  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
};

// Generate Python imports based on node types used
const generateImports = (nodes: Node[]): string => {
  const imports = [
    "import torch",
    "import torch.nn as nn",
    "import torch.optim as optim",
    "import torchvision.transforms as transforms",
    "from torch.utils.data import DataLoader",
  ];
  
  // Check if we have any specific node types that need imports
  const nodeTypes = new Set(nodes.map(node => {
    const data = getNodeData(node);
    return data.template?.type || '';
  }));
  
  if (nodeTypes.has("dataLoader") || nodeTypes.has("imageInput")) {
    imports.push("import torchvision.datasets as datasets");
  }
  
  if (nodeTypes.has("visualize")) {
    imports.push("import matplotlib.pyplot as plt");
  }
  
  return imports.join("\n");
};

// Generate a PyTorch model class from the flow
const generateModelClass = (nodes: Node[], edges: Edge[]): string => {
  const layerNodes = nodes.filter(node => {
    const data = getNodeData(node);
    const template = data.template;
    return template && (
      template.category === "layer" || 
      template.category === "activation"
    );
  });
  
  let modelCode = `
class FlowModel(nn.Module):
    def __init__(self):
        super(FlowModel, self).__init__()
        `;
  
  // Generate layer definitions
  layerNodes.forEach((node, index) => {
    const data = getNodeData(node);
    const params = data.params || {};
    
    switch (data.template?.type) {
      case "linear":
        const inFeatures = params.in_features || 784;
        const outFeatures = params.out_features || 128;
        modelCode += `        self.fc${index + 1} = nn.Linear(${inFeatures}, ${outFeatures})\n`;
        break;
      case "conv2d":
        const inChannels = params.in_channels || 3;
        const outChannels = params.out_channels || 16;
        const kernelSize = params.kernel_size || 3;
        modelCode += `        self.conv${index + 1} = nn.Conv2d(${inChannels}, ${outChannels}, ${kernelSize})\n`;
        break;
      case "lstm":
        const inputSize = params.input_size || 28;
        const hiddenSize = params.hidden_size || 64;
        modelCode += `        self.lstm${index + 1} = nn.LSTM(${inputSize}, ${hiddenSize}, batch_first=True)\n`;
        break;
      case "relu":
        modelCode += `        self.relu${index + 1} = nn.ReLU()\n`;
        break;
      case "sigmoid":
        modelCode += `        self.sigmoid${index + 1} = nn.Sigmoid()\n`;
        break;
      case "tanh":
        modelCode += `        self.tanh${index + 1} = nn.Tanh()\n`;
        break;
    }
  });
  
  // Generate forward method
  modelCode += `
    def forward(self, x):`;
  
  // If we have no layers, add a basic pass-through
  if (layerNodes.length === 0) {
    modelCode += `
        return x`;
  } else {
    // Generate sequential forward pass based on the layout
    // This is a simplified approach - for complex graphs with branches,
    // a more sophisticated topological sort would be needed
    const inputNodes = getInputNodes(layerNodes, edges);
    
    const processedNodes = new Set<string>();
    const nodeOutputs = new Map<string, string>();
    
    const processNode = (node: Node, inputVar: string): string => {
      if (processedNodes.has(node.id)) {
        return nodeOutputs.get(node.id) || inputVar;
      }
      
      const data = getNodeData(node);
      const index = layerNodes.findIndex(n => n.id === node.id) + 1;
      let outputVar = inputVar;
      
      switch (data.template?.type) {
        case "linear":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar} = self.fc${index}(${inputVar})`;
          break;
        case "conv2d":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar} = self.conv${index}(${inputVar})`;
          break;
        case "lstm":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar}, _ = self.lstm${index}(${inputVar})`;
          break;
        case "relu":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar} = self.relu${index}(${inputVar})`;
          break;
        case "sigmoid":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar} = self.sigmoid${index}(${inputVar})`;
          break;
        case "tanh":
          outputVar = `x${index}`;
          modelCode += `
        ${outputVar} = self.tanh${index}(${inputVar})`;
          break;
      }
      
      processedNodes.add(node.id);
      nodeOutputs.set(node.id, outputVar);
      
      // Process children
      const childIds = getChildNodes(node.id, edges);
      let lastOutput = outputVar;
      
      for (const childId of childIds) {
        const childNode = layerNodes.find(n => n.id === childId);
        if (childNode) {
          lastOutput = processNode(childNode, outputVar);
        }
      }
      
      return lastOutput;
    };
    
    // Start processing from input nodes
    let lastOutputVar = "x";
    for (const inputNode of inputNodes) {
      lastOutputVar = processNode(inputNode, "x");
    }
    
    // Return the final output
    modelCode += `
        return ${lastOutputVar}`;
  }
  
  modelCode += `
`;
  
  return modelCode;
};

// Generate training code based on the flow
const generateTrainingCode = (nodes: Node[]): string => {
  const hasImageInput = nodes.some(node => {
    const data = getNodeData(node);
    return data.template?.type === "imageInput";
  });
  
  const optimizer = nodes.find(node => {
    const data = getNodeData(node);
    return data.template?.category === "optimizer";
  });
  
  const optimizerData = optimizer ? getNodeData(optimizer) : null;
  const optimizerType = optimizerData?.template?.type || "adam";
  const optimizerParams = optimizerData?.params || {};
  
  const loss = nodes.find(node => {
    const data = getNodeData(node);
    return data.template?.category === "loss";
  });
  
  const lossData = loss ? getNodeData(loss) : null;
  const lossType = lossData?.template?.type || "crossEntropy";
  
  let trainingCode = `
# Setup data loaders
`;

  if (hasImageInput) {
    trainingCode += `
# Example with MNIST dataset
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
test_dataset = datasets.MNIST('./data', train=False, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=1000)
`;
  } else {
    trainingCode += `
# Define your custom dataset and DataLoader setup here
# Example:
# train_loader = DataLoader(your_dataset, batch_size=64, shuffle=True)
# test_loader = DataLoader(your_test_dataset, batch_size=1000)
`;
  }

  trainingCode += `
# Initialize the model
model = FlowModel()

# Define loss function
`;

  // Add loss function
  if (lossType === "crossEntropy") {
    trainingCode += `criterion = nn.CrossEntropyLoss()`;
  } else if (lossType === "mse") {
    trainingCode += `criterion = nn.MSELoss()`;
  } else {
    trainingCode += `criterion = nn.CrossEntropyLoss()  # default`;
  }

  // Add optimizer
  trainingCode += `

# Define optimizer
`;
  if (optimizerType === "adam") {
    const lr = optimizerParams.lr || 0.001;
    trainingCode += `optimizer = optim.Adam(model.parameters(), lr=${lr})`;
  } else if (optimizerType === "sgd") {
    const lr = optimizerParams.lr || 0.01;
    const momentum = optimizerParams.momentum || 0.9;
    trainingCode += `optimizer = optim.SGD(model.parameters(), lr=${lr}, momentum=${momentum})`;
  } else {
    trainingCode += `optimizer = optim.Adam(model.parameters(), lr=0.001)  # default`;
  }

  // Add training loop
  trainingCode += `

# Training loop
def train(epochs=5):
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            if batch_idx % 100 == 99:
                print(f'Epoch: {epoch+1}, Batch: {batch_idx+1}, Loss: {running_loss/100:.6f}')
                running_loss = 0.0
        
        # Evaluate on test set
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for data, target in test_loader:
                output = model(data)
                _, predicted = torch.max(output.data, 1)
                total += target.size(0)
                correct += (predicted == target).sum().item()
        
        print(f'Epoch: {epoch+1}, Accuracy: {100 * correct / total:.2f}%')

# Run training
train()
`;

  return trainingCode;
};

export const generatePyTorchCode = (nodes: Node[], edges: Edge[]): string => {
  const imports = generateImports(nodes);
  const modelClass = generateModelClass(nodes, edges);
  const trainingCode = generateTrainingCode(nodes);
  
  return `${imports}

${modelClass}
${trainingCode}
`;
};
