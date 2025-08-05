# Compiler and flags
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra
OPENCV_FLAGS = $(shell pkg-config --cflags --libs opencv4)
NLOHMANN_FLAGS = $(shell pkg-config --cflags --libs nlohmann_json)

# Directories
SRC_DIR = .
BUILD_DIR = build

# Source files
SRCS = $(wildcard $(SRC_DIR)/*.cpp)
OBJS = $(SRCS:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)
TARGET = main

# Default target
all: $(BUILD_DIR)/$(TARGET)

# Create build directory
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Compile object files
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@ $(OPENCV_FLAGS) $(NLOHMANN_FLAGS)

# Link executable
$(BUILD_DIR)/$(TARGET): $(OBJS)
	$(CXX) $(OBJS) -o $@ $(OPENCV_FLAGS) $(NLOHMANN_FLAGS)

# Clean build files
clean:
	rm -rf $(BUILD_DIR)

# Install dependencies (macOS)
install-deps:
	brew install opencv nlohmann-json

# Run the program
run: $(BUILD_DIR)/$(TARGET)
	./$(BUILD_DIR)/$(TARGET)

# Show help
help:
	@echo "Available targets:"
	@echo "  all        - Build the program"
	@echo "  clean      - Remove build files"
	@echo "  install-deps - Install dependencies"
	@echo "  run        - Build and run the program"
	@echo "  help       - Show this help"

.PHONY: all clean install-deps run help 