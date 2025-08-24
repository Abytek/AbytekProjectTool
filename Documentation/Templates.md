# Project Templates Guide

## Available Templates

### Common Template
Base template providing core functionality:
```javascript
// APTProject.js
APT.Templates.Common.ProjectPrototypes.Default(Project);
```

### CMake Template
For CMake-based projects:
```javascript
// APTProject.js
APT.Templates.CMake.ProjectPrototypes.Default(Project);
```

### Abytek CMake Template
Extended CMake template with Abytek features:
```javascript
// APTProject.js
APT.Templates.AbytekCMake.ProjectPrototypes.Default(Project);
```

### Unreal Engine Template
For Unreal Engine projects:
```javascript
// APTProject.js
APT.Templates.UnrealEngine.ProjectPrototypes.Default(Project);
```

## Using Templates

1. Create project entry file (APTProject.js)
2. Import required template
3. Configure project options
4. Add any custom components

## Creating Custom Templates

Templates can be extended by:
1. Creating custom components
2. Defining project prototypes
3. Adding utility functions

See source code comments for detailed API documentation.