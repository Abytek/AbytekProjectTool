# AbytekProjectTool Overview

## What is AbytekProjectTool?

AbytekProjectTool (APT) is a modular project management and build system built on Node.js. It helps manage complex projects with multiple build systems, IDEs, and project templates.

## Key Features

- **Project Management**: Handle multiple project instances with different configurations
- **Build System Integration**: Support for CMake, Unreal Engine, and custom build systems
- **IDE Support**: Integration with Visual Studio 2022 and VS Code
- **Template System**: Extensible project templates for different project types
- **Command Line Interface**: Easy-to-use CLI for project operations

## Getting Started

1. **Installation**:
   ```bash
   # Windows
   Scripts/Install.bat

   # Unix-like systems
   Scripts/Install.sh
   ```

2. **Basic Usage**:
   ```bash
   # Get help
   abytekpt

   # Import a project (for specific example, you can import the HelloAPT sample project below)
   abytekpt <ProjectEntryDirectory>
   ```

## Common Project Structure

```
YourProject/              # Project entry directory
  ├── APTProject.js       # Project entry file
  └── Build/              # Build outputs
```

## Sample Projects

The repository includes several example projects demonstrating different use cases:

### HelloAPT
Basic example showing core APT features:
```
HelloAPT/
  ├── HelloAPT/              # First project instance
  │   ├── APTProject.js      # Project configuration
  │   └── CMakeLists.txt     # CMake build setup
  └── HelloAPT2/             # Second project instance
      ├── APTProject.js      # Different configuration
      └── CMakeLists.txt     # Custom build setup
```
Demonstrates:
- Multiple project instances
- Basic CMake integration
- Project configuration

How to import:   
```bash
abytekpt ./Samples/HelloAPT/HelloAPT/APTProject.js
```

### AbytekEBT
AbytekEBT template usage:
```
AbytekEBT/
  └── APTProject.js          # Extended CMake configuration
```
Demonstrates:
- AbytekEBT usage for importing Abytek Engine.

How to import:   
```bash
abytekpt Samples/AbytekEBT/APTProject.js
```

## Further Reading

- See `ArchitectureAndKeyConcepts.md` for internal architecture details
- See `Cache.md` for cache system
- See `CLI.md` for detailed command usage
- See `Templates.md` for template system documentation