# Multi-stage build for C++ and Go
FROM golang:1.24-alpine AS go-builder

# Install build dependencies
RUN apk add --no-cache gcc g++ make cmake pkgconfig

# Install OpenCV and nlohmann/json
RUN apk add --no-cache \
    opencv-dev \
    nlohmann-json-dev \
    && ln -s /usr/include/opencv4/opencv2 /usr/include/opencv2

# Set working directory
WORKDIR /app

# Copy Go source code
COPY src/ ./src/

# Install Go dependencies
RUN cd src && go mod download

# Build Go application
RUN cd src && go build -o ../main .

# Build C++ application
COPY opencv/ ./opencv/
RUN cd opencv && make all

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    opencv \
    nlohmann-json \
    ca-certificates

# Create app directory
WORKDIR /app

# Copy binaries from builder
COPY --from=go-builder /app/main ./main
COPY --from=go-builder /app/opencv/build/main ./opencv/main

# Create shared directories
RUN mkdir -p /app/shared/results /app/shared/uploads

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]
