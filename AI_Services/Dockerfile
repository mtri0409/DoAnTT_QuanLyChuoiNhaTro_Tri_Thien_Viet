FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

# Pre-download and cache VietOCR model weights during image build time.
# This prevents downloading model weights at startup and allows offline execution.
RUN python -c "from vietocr.tool.predictor import Predictor; from vietocr.tool.config import Cfg; config = Cfg.load_config_from_name('vgg_transformer'); config['device'] = 'cpu'; Predictor(config)"

# Copy model weights and application source code
COPY runs ./runs
COPY . .

# Expose the API port
EXPOSE 8000

# Start FastAPI server using uvicorn
CMD ["uvicorn", "ai_services:app", "--host", "0.0.0.0", "--port", "8000"]
