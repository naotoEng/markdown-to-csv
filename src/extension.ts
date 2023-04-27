// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MarkdownToCSV } from "./converter";
import * as path from "path";
import * as os from "os";
import { csvToHtmlTable } from "./csvToHtmlTable";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // プレビュー処理
  const disposable = vscode.commands.registerCommand(
    "markdown-to-csv.PreviewCSV",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (!activeEditor) {
        vscode.window.showErrorMessage("No active text found");
        return;
      }

      // MarkdownをCSVに変換
      const markdownContent = activeEditor.document.getText();
      const originalEOL =
        activeEditor.document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
      const csvText = new MarkdownToCSV(originalEOL).parse(markdownContent);

      // CSVをHTMLに変換
      const htmlText = csvToHtmlTable(csvText);

      const panel = vscode.window.createWebviewPanel(
        "markdownTablePreview",
        "Markdown Table Preview",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "assets")),
          ],
        }
      );
      panel.webview.html = `
      <!DOCTYPE html>
        <html>
        <head>
          <style>
            /* ここにスタイルを追加して、プレビューパネルのデザインをカスタマイズできます */
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              font-weight: bold;
            }
            td {
              white-space: pre;
            }
          </style>
        </head>
        <body>
          ${htmlText}
        </body>
        </html>
      `;
    }
  );

  // ファイル保存処理
  const disposable2 = vscode.commands.registerCommand(
    "markdown-to-csv.DownloadCSV",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;

      if (!activeEditor) {
        vscode.window.showErrorMessage("No active text found");
        return;
      }

      // MarkdownをCSVに変換
      const markdownContent = activeEditor.document.getText();
      const originalEOL =
        activeEditor.document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
      const csvText = new MarkdownToCSV(originalEOL).parse(markdownContent);

      const currentUri = activeEditor.document.uri;
      const fileNameWithoutExtension =
        currentUri.path.split("/").pop()?.split(".").slice(0, -1).join(".") ||
        "Untitled";
      const desktopPath = path.join(os.homedir(), "Desktop");
      const defaultCsvUri = vscode.Uri.file(
        path.join(desktopPath, `${fileNameWithoutExtension}.csv`)
      );
      const options: vscode.SaveDialogOptions = {
        defaultUri: defaultCsvUri,
        filters: {
          "CSV Files": ["csv"],
          "All Files": ["*"],
        },
      };
      try {
        const newUri = await vscode.window.showSaveDialog(options);
        if (newUri) {
          const iconv = require("iconv-lite");
          const shiftJisBuffer = iconv.encode(csvText, "Shift-JIS");

          await vscode.workspace.fs.writeFile(newUri, shiftJisBuffer);
          // const newDocument = await vscode.workspace.openTextDocument(newUri);
          // await vscode.window.showTextDocument(newDocument);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            "Error saving file as: " + error.message
          );
        } else {
          vscode.window.showErrorMessage(
            "Error saving file as: An unknown error occurred."
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable, disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
