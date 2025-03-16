![image](https://github.com/user-attachments/assets/cfed0f30-8e65-4512-9a6b-002335f5bf01)

# PyTorch Flow - Visual Neural Network Designer

![PyTorch Flow](/public/pytorch-flow-banner.png)

PyTorch Flow is an interactive, visual editor for designing neural network architectures using a flow-based interface. It allows you to create, visualize, and export PyTorch neural network models without writing any code.

## Features

- **Visual Neural Network Design**: Drag-and-drop interface for creating complex neural networks
- **Component Library**: Rich set of pre-defined components including layers, activations, optimizers, and more
- **Live Editing**: Configure node parameters in real-time
- **Code Export**: Generate PyTorch Python code that can be run locally
- **Save & Load**: Persist your designs and continue working on them later
- **Undo/Redo**: Full history management for design changes

## Getting Started

### Online Version

Try PyTorch Flow online at [https://pytorch-flow.lovable.dev](https://pytorch-flow.lovable.dev)

### Local Installation

```sh
# Clone the repository
git clone https://github.com/yourusername/pytorch-flow.git
cd pytorch-flow

# Install dependencies
npm install

# Start the development server
npm run dev
```

## How to Use

1. **Design Your Network**:
   - Drag components from the sidebar onto the canvas
   - Connect nodes by dragging from output handles to input handles
   - Configure node parameters in the properties panel

2. **Test Run Your Network**:
   - Click the "Run" button to simulate training (note: this doesn't execute real PyTorch code in the browser)

3. **Export to PyTorch Code**:
   - Once your design is complete, click "Export" to download Python code
   - The exported code includes model definition, data loading, and training logic

4. **Run Locally**:
   - Save the exported file (e.g., `pytorch_model.py`)
   - Run the code in a Python environment with PyTorch installed

## Running Exported Models

To run the exported PyTorch code:

1. Make sure you have Python and PyTorch installed:
   ```bash
   pip install torch torchvision
   ```

2. Run the exported Python file:
   ```bash
   python pytorch_model.py
   ```

## Available Components

### Input Nodes
- **Data Loader**: Load and batch data for training
- **Image Input**: Input for image data

### Layer Nodes
- **Linear Layer**: Fully connected layer
- **Conv2D**: 2D convolutional layer
- **LSTM**: Long Short-Term Memory layer

### Activation Nodes
- **ReLU**: Rectified Linear Unit activation
- **Sigmoid**: Sigmoid activation function
- **Tanh**: Hyperbolic tangent activation

### Optimizer Nodes
- **Adam**: Adam optimizer
- **SGD**: Stochastic Gradient Descent

### Transform Nodes
- **Normalize**: Normalize input data
- **Resize**: Resize input dimensions

### Loss Nodes
- **Cross Entropy**: Cross entropy loss function
- **MSE**: Mean squared error loss

### Operation Nodes
- **Concatenate**: Concatenate multiple inputs
- **Split**: Split input into multiple outputs

### Output Nodes
- **Model**: Final model output
- **Visualize**: Visualize model performance
- **Export**: Export trained model

## Example Models

Here are a few examples you can build with PyTorch Flow:

1. **Basic CNN for MNIST**:
   - Image Input → Conv2D → ReLU → Conv2D → ReLU → Linear → Cross Entropy

2. **Simple LSTM for Sequence Data**:
   - Data Loader → LSTM → Linear → Sigmoid → MSE

3. **Multi-branch Network**:
   - Image Input → Split → (Branch 1: Conv2D → ReLU) + (Branch 2: Resize → Conv2D) → Concatenate → Linear

## Limitations

- The visual editor doesn't execute actual PyTorch code in the browser
- The generated code provides a starting point but may need customization for complex architectures
- Some advanced PyTorch features aren't currently represented in the visual editor

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, TypeScript, and [React Flow](https://reactflow.dev/)
- Inspired by PyTorch and visual programming environments
