import * as vscode from 'vscode';
import * as https from 'https';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Debugly is now active');

    // Command: Authenticate
    let loginCmd = vscode.commands.registerCommand('debugly.login', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Debugly Neural Key',
            placeHolder: 'dbly_...',
            password: true,
            ignoreFocusOut: true
        });

        if (token) {
            await context.secrets.store('debugly.token', token);
            vscode.window.showInformationMessage('Debugly: Neural Key saved successfully.');
        }
    });

    // Command: Analyze Selection
    let analyzeCmd = vscode.commands.registerCommand('debugly.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Debugly: No active editor found.');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection) || editor.document.getText();
        
        if (!text.trim()) {
            vscode.window.showErrorMessage('Debugly: No code found to analyze.');
            return;
        }

        const token = await context.secrets.get('debugly.token');
        if (!token) {
            const action = 'Get Token';
            const choice = await vscode.window.showErrorMessage('Debugly: Neural Key not found.', action);
            if (choice === action) {
                vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000/settings'));
            }
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Debugly: Analyzing neural patterns...",
            cancellable: false
        }, async () => {
            return new Promise<void>((resolve, reject) => {
                const body = JSON.stringify({
                    error: '',
                    context: [{
                        id: 'vscode-selection',
                        name: editor.document.fileName,
                        content: text,
                        isMainError: true
                    }],
                    modelId: 'llama-3.1-8b-instant'
                });

                const options: https.RequestOptions = {
                    hostname: 'localhost', // TODO: Change to production URL
                    port: 3000,
                    path: '/api/analyze',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Content-Length': Buffer.byteLength(body)
                    }
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', async () => {
                        if (res.statusCode === 200) {
                            const result = JSON.parse(data);
                            const action = 'View Full Report';
                            const choice = await vscode.window.showInformationMessage(
                                `Debugly: ${result.title} (${result.severity})`,
                                action
                            );
                            if (choice === action && result.analysisId) {
                                vscode.env.openExternal(vscode.Uri.parse(`http://localhost:3000/analysis/${result.analysisId}`));
                            }
                            resolve();
                        } else {
                            vscode.window.showErrorMessage(`Debugly: Analysis failed (${res.statusCode})`);
                            reject();
                        }
                    });
                });

                req.on('error', (e) => {
                    vscode.window.showErrorMessage(`Debugly Error: ${e.message}`);
                    reject(e);
                });

                req.write(body);
                req.end();
            });
        });
    });

    context.subscriptions.push(loginCmd, analyzeCmd);
}

export function deactivate() {}
