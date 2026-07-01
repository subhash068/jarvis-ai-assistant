FROM python:3.11-slim

# Install system dependencies for Playwright, OpenCV, and FFmpeg
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    libgconf-2-4 \
    libxss1 \
    libnss3 \
    libasound2 \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY backend/demo_agent/requirements_demo.txt .
RUN pip install --no-cache-dir -r requirements_demo.txt

# Install playwright browsers
RUN playwright install chromium
RUN playwright install-deps

# Copy the demo agent code
COPY backend/demo_agent /app/demo_agent

# Run the orchestrator script
ENTRYPOINT ["python", "-m", "demo_agent.main"]
CMD ["Create demo of my agriculture website"]
