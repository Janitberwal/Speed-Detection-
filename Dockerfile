FROM python:3.10-slim

# Set up a non-root user for Hugging Face Spaces security
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy and install dependencies first
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY --chown=user . .

# Ensure temp and output directories exist and are writable
RUN mkdir -p temp output

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]