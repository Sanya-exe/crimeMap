# Update pip and build tools
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt

# Install CPU-only torch (no CUDA needed for deployment)
pip install torch==2.9.0+cpu --index-url https://download.pytorch.org/whl/cpu
