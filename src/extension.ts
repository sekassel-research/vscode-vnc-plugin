// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const WEBVIEW_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>VNC Viewer</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
	<script>
		const offsetWidth = 40;
		const offsetHeight = 20;

		function buildIframe(vncUrl) {
			let iframe = document.createElement('iframe');
			iframe.width = window.innerWidth - offsetWidth;
			iframe.height = window.innerHeight - offsetHeight;
			iframe.style.border = 'none';
			iframe.src = vncUrl;
			document.body.append(iframe);

			//resize our vnc window to the vs code webview
			window.onresize = () => {
				iframe.width = window.innerWidth - offsetWidth;
				iframe.height = window.innerHeight - offsetHeight;
			};
		}

		window.addEventListener('message', event => buildIframe(event.data.vncUrl));
	</script>
</body>
</html>`;

let currentPanel: vscode.WebviewPanel | undefined;

async function getVncUrl(): Promise<string | undefined> {
	return process.env.VNC_URL;
}

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('vnc-viewer.start', async () => {
		if (currentPanel) {
			currentPanel.reveal();
			return;
		}
		const vncUrl = await getVncUrl();
		if (!vncUrl) {
			vscode.window.showErrorMessage('VNC URL not found');
			return;
		}

		currentPanel = vscode.window.createWebviewPanel(
			'vncView',
			'vnc viewer',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
			}
		);
		const webview = currentPanel.webview;
		webview.html = WEBVIEW_CONTENT;
		webview.postMessage({ vncUrl });

		// Reset when the current panel is closed
		currentPanel.onDidDispose(() => currentPanel = undefined);

		//send the vncUrl when state changes and the panel is active (in foreground)
		currentPanel.onDidChangeViewState(e => {
			if (e.webviewPanel.active) {
				webview.postMessage({ vncUrl });
			}
		});
	}));

	//add command for opening external browser window
	context.subscriptions.push(vscode.commands.registerCommand('vnc-viewer.openExternal', async () => {
		const vncUrl = await getVncUrl();
		if (!vncUrl) {
			vscode.window.showErrorMessage('VNC URL not found');
			return;
		}
		vscode.env.openExternal(vscode.Uri.parse(vncUrl));
	}));
}

export function deactivate() { }
