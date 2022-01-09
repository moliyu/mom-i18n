import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
const { createWebviewPanel } = window

async function getWebViewContent(context: ExtensionContext|null, templatePath: string) {
  if (context) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
      return $1 + Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
  } else {
    const res = await axios.get(templatePath)
    let html = res.data.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m: any, $1: string, $2: string) => {
      return $1 + templatePath + $2 + '"';
    });
    return html
  }
}
class View {
  public static panel: WebviewPanel | null
  static _ctx: ExtensionContext
  public static async getpanel(ctx: ExtensionContext) {
    this._ctx = ctx
    if (!this.panel) {
      this.panel = createWebviewPanel('test', 'i18n', {
        viewColumn: ViewColumn.Active
      }, {
        enableScripts: true,
        retainContextWhenHidden: true,
      })
      const html = await getWebViewContent(null, 'http://localhost:8080/')
      this.panel.webview.html = html
    }
    this.panel.onDidDispose(() => {
      this.panel = null
    })
    return this.panel
  }
}

export default View