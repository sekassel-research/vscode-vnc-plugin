# vs code vnc plugin for fulib.org projects
This extension adds an embedded vnc viewer to the vs code server instance, which is used by fulib.org projects.

## Create .vsix
To get a .vsix you can use vsce (a CLI tool for managing VS Code extensions).
You can install vsce with the node package manager (npm):
```
npm install -g vsce
```
Package the extension with: 
```
vsce package
```