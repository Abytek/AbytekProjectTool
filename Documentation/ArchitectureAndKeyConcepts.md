# Architecture and Key Concepts

## Core Concepts

### Project System
- Projects are modular units of work
- Each project has components that define behavior
- Projects can be instantiated multiple times with different configurations

### Project Component System
- Components are reusable pieces of functionality
- Components have a defined lifecycle (Init → PostInit → Start)
- Components can depend on other components

### Project Prototypes
- Project prototypes help us coconveniently add components to projects.

### Template System
- Templates provide supports, project components, project prototypes and utilities for different project types, build systems and IDEs.

## Design Principles

1. **Modularity**
   - Functionality is split into composable project components
   - Systems are loosely coupled

2. **Extensibility**
   - New components can be added
   - Multiple build systems can be integrated

3. **Configuration**
   - Project and system configurations can be set through CLI and project additional options.

## System Integration

- Built on AbytekModuleJS for module management
- Integrates with various build systems
- Supports multiple IDEs and editors

## Further Details

See source code comments for detailed implementation information.