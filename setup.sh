#!/bin/bash

echo "Setting up Star Fee Distributor..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Create a simple .eslintignore file
echo "Creating .eslintignore..."
cat > .eslintignore << EOF
node_modules/
target/
dist/
*.js
*.d.ts
EOF

# Create a simple .prettierrc for code formatting
echo "Creating Prettier configuration..."
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to build the program"
echo "2. Run 'npm test' to run the test suite"
echo "3. Run 'npm run lint' to check for linting issues"
echo "4. Run 'npm run validate' to validate requirements"
echo ""
echo "Star Fee Distributor is ready for development!"
