import { ExtensionContext } from 'vscode';
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { resolve, parse } from 'path';
import * as fs from 'fs'
import * as prettier from 'prettier'
import View from './view';

enum command {
	toggle = 'mom-i18n.toggle',
	text = 'mom-i18n.text',
	edit = 'mom-i18n.edit',
	add = 'mom-i18n.add'
}

const locale = ['国际化key', 'zh_CN', 'zh_TW', 'en'];
let currentIndex = 0;
let status: vscode.StatusBarItem;
let rootPath: string;
let localePath: string;
let localeObj: Record<string, any> = {}
let view: vscode.WebviewPanel
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

const edit = (ctx: ExtensionContext) => {
	return vscode.commands.registerCommand(command.edit, async(detail) => {
		view = await View.getpanel(ctx, handleEvent)
		if (!view.visible) {
			view.reveal()
		}
		detail.path = detail.path.replace(`${rootPath}/`, '')
		view.webview.postMessage({
			type: 'detail',
			value: detail
		})
	})
}

const add = (ctx: ExtensionContext) => {
	return vscode.commands.registerCommand(command.add, async({text}) => {
		const editor = vscode.window.activeTextEditor
		if (!editor) return
		const path = editor.document.uri.path
		const { dir, name } = parse(path)
		const arr = dir.replace(rootPath + '/', '').split('/').slice(1)
		const prefix = arr.length ? `locales/${arr[0]}/${arr.join('.')}` : `locales/${arr.join('.')}`
		const suffix = `.${name}.js`
		const filepath = prefix + suffix
		view = await View.getpanel(ctx, handleEvent)
		if (!view.visible) {
			view.reveal()
		}
		view.webview.postMessage({
			type: 'add',
			value: {
				locale: {
					zh_CN: text,
					zh_EN: '',
					en: ''
				},
				path: filepath,
				key: ''
			}
		})
	})
}

const handleEdit = (value: any, isAdd=false) => {
	try {
		const { locale, path, key } = value
		const filePath = resolve(rootPath, path)
		const fileStr = fs.readFileSync(filePath, 'utf-8')
		const obj = new Function(`return ${fileStr.replace(/export\s*default/, '')}`)()
		obj[key] = locale
		const needFormat = `export default ${JSON.stringify(obj)}`
		const res = prettier.format(needFormat, {
			semi: false,
			parser: "babel",
			printWidth: 40
		})
		fs.writeFileSync(filePath, res)
		if (!isAdd) {
			view.webview.postMessage({
				type: 'handleOk',
				value: '编辑成功'
			})
		}
		localeObj[key] = locale
	} catch (error) {
		console.log('%c 🥤 error: ', 'font-size:20px;background-color: #2EAFB0;color:#fff;', error);
	}
}

const handleAdd = (value: any) => {
	try {
		const { locale, path, key } = value
		if (localeObj[key]) {
			view.webview.postMessage({
				type: 'error',
				value: `key: ${key}已存在`
			})
			return null
		}
		const filePath = resolve(rootPath, path)
		if (fs.existsSync(filePath)) {
			handleEdit(value, true)
		} else {
			// fs.mkdirSync()
			const { dir } = parse(filePath)
			fs.mkdirSync(dir, { recursive: true })
			const obj: Record<string, any> = {}
			obj[key] = locale
			localeObj[key] = locale
			recordPath[key] = filePath
			const needFormat = `export default ${JSON.stringify(obj)}`
			const res = prettier.format(needFormat, {
				semi: false,
				parser: "babel",
				printWidth: 40
			})
			fs.writeFileSync(filePath, res)
		}
		view.webview.postMessage({
			type: 'handleOk',
			value: '新增成功'
		})
	} catch (error) {
		console.log('%c 🍧 error: ', 'font-size:20px;background-color: #F5CE50;color:#fff;', error);
	}
}

const handleEvent = (event: { type: string, value: any }) => {
	const { locale, path, key } = event.value
	if (event.type === 'edit') {
		handleEdit({ locale, path, key })
	} else if (event.type === 'add') {
		handleAdd({ locale, path, key })
	}
}

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
			localePath = resolve(rootPath, 'locales')
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
	const str = `|${key}|[编辑](command:${command.edit}?${encodeURIComponent(JSON.stringify({
		key,
		locale: obj,
		path: recordPath[key]
	}))})|
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

const createMarkdownAdd = (text: string) => {
	const str = `[创建国际化](command:${command.add}?${encodeURIComponent(JSON.stringify({ text }))})`
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
				if (obj) {
					return new vscode.Hover(createMarkdownTable(hoverWord, obj))
				} else {
					return new vscode.Hover(createMarkdownAdd(hoverWord))
				}
			}
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(active);
	context.subscriptions.push(status);
	context.subscriptions.push(toggle)
	context.subscriptions.push(edit(context))
	context.subscriptions.push(add(context))
}

// this method is called when your extension is deactivated
export function deactivate() {}
