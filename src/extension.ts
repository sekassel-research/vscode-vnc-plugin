// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

let _extensionUri: vscode.Uri;
let _webview: vscode.Webview;
let _vncUrl: string;



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	_extensionUri = context.extensionUri;
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "helloworld" is now active!');

	if (vscode.workspace.workspaceFolders !== undefined) {
		//  /home/coder/project
		let homePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		let vncPath = homePath + '/.vnc/vncUrl';
		let fileBuffer: any = await fs.promises.readFile(vncPath).catch(async (err) => {
			console.log(err);
		});
		_vncUrl = fileBuffer.toString();
	}
	else {
		let message = "Working folder not found, open a folder an try again";
		vscode.window.showErrorMessage(message);
	}


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vnc-viewer.start', () => {
		// The code you place here will be executed every time your command is executed

		if (currentPanel) {
			currentPanel.reveal();
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				'vncView',
				'vnc viewer',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
				}
			);
			_webview = currentPanel.webview;
			_webview.postMessage({ vncUrl: _vncUrl });
			_webview.html = getWebviewContent();

			// Reset when the current panel is closed
			currentPanel.onDidDispose( () => {
				currentPanel = undefined;
			});

			//send the vncUrl when state changes and the panel is active (in foreground)
			currentPanel.onDidChangeViewState((e) => {
				if (e.webviewPanel.active) {
					_webview.postMessage({ vncUrl: _vncUrl });
				}
			});
		}

	});

	context.subscriptions.push(disposable);

	//add command for opening external browser window
	context.subscriptions.push(vscode.commands.registerCommand('vnc-viewer.openExternal', () => {
		vscode.env.openExternal(vscode.Uri.parse(_vncUrl));
	}));


}

function getWebviewContent(): string {

	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>

	<body>
    	<script type="module" crossorigin="anonymous" src="${getResource(['media', 'main.js'])}"></script>
	</body>
	</html>`;
}

function getResource(pathSegments: string[]): vscode.Uri {
	// Local path to main script run in the webview
	const resourcePath = vscode.Uri.joinPath(_extensionUri, ...pathSegments);
	// And the uri we use to load this script in the webview
	return _webview.asWebviewUri(resourcePath);
}


// this method is called when your extension is deactivated
export function deactivate() { }
