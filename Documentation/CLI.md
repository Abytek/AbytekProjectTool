# Command Line Interface Guide

## Available Commands

### Core Commands

- **Help**
  ```bash
  apt
  ```
  Lists all available commands and their usage.

- **ImportMainProject**
  ```bash
  apt <MainProjectEntryFile> <AdditionalArguments...>
  ```
  Imports the main project from its entry file.

- **OpenEditor**
  ```bash
  apt <MainProjectEntryFile> :OpenEditor <AdditionalArguments...>
  ```
  Opens the project in configured IDE.

### Cache Management

- **LogCache**
  ```bash
  apt <MainProjectEntryFile> :LogCache
  ```
  Displays APT cache information.

- **CleanCache**
  ```bash
  apt <MainProjectEntryFile> :CleanCache
  ```
  Cleans APT cache.

## Common Usage Examples

1. **Import Project**:
   ```bash
   apt MyProject/APTProject.js
   ```

1. **Create New Project**:
   ```bash
   apt MyProject/APTProject.js :OpenEditor :GlobalDefault.Editor VisualStudio2022
   ```

2. **Clean cache**:
   ```bash
   apt MyProject/APTProject.js :CleanCache
   ```

## Additional Arguments

- Project-specific options can be passed as additional arguments
- Use `apt` without arguments to see all available options
- CLI input is an object containing various properties set by CLI arguments.
    - Syntax: `:<PropertyName> <Value0> <Value1>`
    - Example: `:GlobalDefault.Editor VisualStudio2022`

## Built-in CLI-based project/global configuration

Projects and JS modules can read project/global configuration passed by CLI arguments.
  + `GlobalDefault`: stores global-scope CLI properties
    + Example: `:GlobalDefault.SupportDebug 1` => supports debugging => projects will support debugging by default. 
  + `ProjectDefault`: stores project-scope CLI properties, used as project additional options
    + Example: `:ProjectDefault.Hello 1` use the default project additional options `{ Hello: 1 }`