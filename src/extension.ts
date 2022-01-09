/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { resolve } from 'path';
import * as fs from 'fs'

enum command {
	toggle = 'mom-i18n.toggle',
	text = 'mom-i18n.text',
	edit = 'mom-i18n.edit'
}

const locale = ['国际化key', 'zh_CN', 'zh_TW', 'en'];
let currentIndex = 0;
let status: vscode.StatusBarItem;
let rootPath: string;
let localeObj: Record<string, any> = {}
const recordPath: Record<string, string> = {}
const decList: vscode.TextEditorDecorationType[] = []

const toggle = vscode.commands.registerCommand(command.toggle, () => {
	currentIndex < locale.length - 1 ? currentIndex++ : currentIndex = 0
	status.text = locale[currentIndex]
	decText()
})

const active = vscode.commands.registerCommand(command.text, async() => {
	vscode.window.showInformationMessage('i18n插件已启动');
	status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	status.text = locale[currentIndex];
	status.tooltip = '单击切换国际化语言显示';
	status.show()
	status.command = command.toggle
	setRootPath()
	decText()
	vscode.window.onDidChangeActiveTextEditor(() => decText())
	vscode.languages.registerHoverProvider('*', hover)
});

const edit = vscode.commands.registerCommand(command.edit, () => {
	console.log('edit')
})

const setRootPath = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !vscode.workspace.workspaceFolders) {
		return null;
	}
	const resource = editor.document.uri;
	if (resource.scheme === 'file') {
		const folder = vscode.workspace.getWorkspaceFolder(resource);
		if (folder) {
			rootPath = folder.uri.fsPath
			const localePath = resolve(rootPath, 'locales')
			getLocales(localePath)
		}
	}
}

const getLocales = (dir: string) => {
	fs.readdirSync(dir).forEach(async(item: string) => {
		if (/\.js/.test(item)) {
			try {
				const filePath = resolve(dir, item)
				const jsFile = fs.readFileSync(filePath, 'utf-8')
				const obj = new Function(`return ${jsFile.replace(/export\s*default/, '')}`)()
				Object.keys(obj).forEach(key => {
					recordPath[key] = filePath
					localeObj[key] = obj[key]
				})
			} catch (error) {
				console.log(error)	
			}
		} else {
			getLocales(resolve(dir, item))
		}
	})
}

const createDecorationType = (text: string) => {
	const decorationType: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
		opacity: '0',
		textDecoration: 'none;position: absolute',
		before: {
			contentText: text,
			border: '1px dashed yellow',
		}
	})
	return decorationType
}

const decText = () => {
	console.log('%c 🌶 decText: ', 'font-size:20px;background-color: #93C0A4;color:#fff;');
	const editor = vscode.window.activeTextEditor
	if (!editor) {
		return null
	}
	let doc = editor.document
	let text = doc.getText()
	const reg = /\$t\(['"](.*)['"]\)/g
	let match
	while (decList.length) {
		const dec = decList.shift()
		dec?.dispose()
	}
	while (match = reg.exec(text)) {
		const localeKey = match[1]
		const startPos = doc.positionAt(match.index + 4)
		const endPos = doc.positionAt(match.index + 4 + match[1].length)
		const decorartion = {
			range: new vscode.Range(startPos, endPos),
		}
		if (localeObj[localeKey] && localeObj[localeKey][locale[currentIndex]]) {
			const decType = createDecorationType(localeObj[localeKey][locale[currentIndex]])
			decList.push(decType)
			editor.setDecorations(decType, [decorartion])
		}
	}
}

const createMarkdownTable = (key: string, obj: Record<string, string>) => {
	const str = `|${key}|[↗️](command:${command.edit})|
|:---:|----|
|zh_cn|  ${obj['zh_CN']}  |
|zh_tw|  ${obj['zh_TW']}  |
|en_us|  ${obj['en']}  |
`
	const markdown = new vscode.MarkdownString(str, true)
	markdown.isTrusted = true
	markdown.supportHtml = true
	return markdown
}

const hover: vscode.HoverProvider = {
	provideHover(document, position) {
		const editor = vscode.window.activeTextEditor
		if (editor) {
			const { start, end } = editor.selection
			const hoverWord = editor.document.getText(new vscode.Range(start, end))
			if (hoverWord) {
				const obj = localeObj[hoverWord]
				if (!obj) return null
				// const markdown = new vscode.MarkdownString(`### zh_cn: ${obj['zh_CN']}
				// + zh_tw: ${obj['zh_TW']}
				// + en: ${obj['en']}
				// `, true)
				// markdown.isTrusted = true
				const markdown = createMarkdownTable(hoverWord, obj)
				return new vscode.Hover(markdown)
			}
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(active);
	context.subscriptions.push(status);
	context.subscriptions.push(toggle)
	context.subscriptions.push(edit)
}

// this method is called when your extension is deactivated
export function deactivate() {}
