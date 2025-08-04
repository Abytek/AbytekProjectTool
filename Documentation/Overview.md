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
   apt

   # Import a project
   apt <ProjectEntryFile>
   ```

## Documentation Structure

- **ArchitectureAndKeyConcepts.md** - System architecture and design principles
- **CLI.md** - Command line interface usage and examples
- **Templates.md** - Available templates and how to use them

## Project Structure

```
YourProject/
  ├── APTProject.js       # Project entry file
  ├── Source/             # Source code
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
apt ./Samples/HelloAPT/HelloAPT/APTProject.js
```

### AbytekCMake
AbytekCMake template usage:
```
AbytekCMake/
  └── APTProject.js          # Extended CMake configuration
```
Demonstrates:
- AbytekCMake usage for importing Abytek Engine.

How to import:   
```bash
apt Samples/AbytekCMake/APTProject.js
```

## Further Reading

- See `ArchitectureAndKeyConcepts.md` for internal architecture details
- See `Cache.md` for detailed command usage
- See `CLI.md` for detailed command usage
- See `Templates.md` for template system documentation