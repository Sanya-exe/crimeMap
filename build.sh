# Update pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install CPU-only torch (lighter version, no CUDA needed)
pip install torch==2.3.0+cpu --index-url https://download.pytorch.org/whl/cpu
