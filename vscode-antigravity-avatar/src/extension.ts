import * as vscode from 'vscode';
import { ChatPanel } from './ChatPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('AntiGravity Avatar is now active!');

    // Start Assistant Command
    let disposable = vscode.commands.registerCommand('antigravity.startAssistant', () => {
        // We will create the webview panel using ChatPanel
        ChatPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
