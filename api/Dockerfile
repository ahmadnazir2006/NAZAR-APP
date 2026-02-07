# Use a lightweight Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies for Pillow and Image processing
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8000"]