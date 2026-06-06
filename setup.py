from setuptools import setup, find_packages

# Read the contents of your requirements.txt file
with open('requirements.txt') as f:
    required = f.read().splitlines()

setup(
    name="Crime-Prediction",  # Replace with your project name
    version="0.1.0",  # Replace with your project's version
    packages=find_packages(),  # Automatically find packages in your project
    install_requires=required,  # List of dependencies
    author="Rohit Sharma",  # Replace with your name
    author_email="rs783070@gmail.com",  # Replace with your email
    description="Predicts about crime",  # Replace with a short description
    url="https://github.com/Rohit95683/Crim",  # Replace with your project's URL
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.11',  # Specify the Python version compatibility
)
