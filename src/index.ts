import { log } from "console";
import express, { Express, Request, Response } from "express";
import path, { resolve } from "path";
var shelljs = require("shelljs");

interface PostResponse {
	nothing: boolean
	content: string | object
	replaceLine: boolean
	actions: { name: string, [key: string]: any }[]
}

type AllActions = 'PUSH_STATE' | 'SET_VALUE' | 'APPEND_CLASSES' | 'REMOVE_NODE' | 'INSERT_HTML' | 'REDIRECT' | 'RELOAD' | 'TOAST' | 'SWAL2' | 'REPLACE_NODE'

interface ResponseDataItem {
	action: AllActions,
	params: { [key: string]: any }
}

export default () => {
	const app: Express = express();
	const port = process.env.EXPRESS_PORT || 3000;
	app.use(express.static('public'))
	app.use(express.json())

	let cache: unknown = null;

	app.get("/completion", async (req: Request, res: Response) => {
		// get the url from environment variable COMPLETION_ENDPOINT
		const url = process.env.COMPLETION_ENDPOINT ||
			'http://localhost:4002/rest-get/?obtype=SettingInDb&id=codemirror-play';
		const response = await fetch(url);
		if (!cache) {
			try {
				cache = await response.json();
				console.log("fetched: ", cache)
			} catch (error) {
				console.log(error)
				console.log("-------------end of error ----------------")
			}
		}
		res.send(cache || {
			data: [
				"free -mh, Display amount of free and used memory in the system, local",
				"df -lh / /mnt/g, report file system disk space usage",
				"ps aux, report a snapshot of the current processes",
				"diff -bur folder1 folder2, compare two folders recursively",
			]
		});
	});

	app.get("/execute", (req: Request, res: Response) => {
		let cmd = req.query.cmd as string;
		let parts = cmd.split(",", 2);
		shelljs.exec(parts[0].trim(), (code: number, stdout: any, stderr: any) => {
			if (code === 0) {
				res.send({ data: stdout });
			} else {
				res.send({ data: stderr });
			}
		})
	})
	app.get("/devtools/cmcontents/:id", (req: Request, res: Response) => {
		// response with a {data: {id: number, content: string}}
		res.send({ data: { id: req.params.id, content: "content of " + req.params.id } });
	})

	app.post("/devtools/cmcontents", (req: Request, res: Response) => {
		// response with a {data: {id: number, content: string}}
		res.send({ data: { id: 123, content: "content of 123" } });
	})

	app.get("/devtools/asdf-completion", (req: Request, res: Response) => {
		const line = req.query.line as string
		const parts = line.trim().split(/\s+/);
		if (parts[0] !== 'asdf') {
			res.send({ data: [] })
			return
		}
		if (parts.length === 1) {
			res.send({
				data: [
					{
						label: parts[0] + " java",
						type: "magicwand",
						detail: "replace the current line with this",
						info: "new content of the current line"
					},
					{
						label: parts[0] + " nodejs",
						type: "magicwand",
						detail: "replace the current line with this",
						info: "new content of the current line\nline 2\nline3\n\nlinen"
					}
				]
			});
		} else if (parts.length === 2) {
			res.send({
				data: [
					{
						label: parts[0] + " " + parts[1] + " " + "000",
						type: "magicwand",
						detail: "replace the current line with this",
						info: "new content of the current line"
					},
					{
						label: parts[0] + " " + parts[1] + " " + "111",
						type: "magicwand",
						detail: "replace the current line with this",
						info: "new content of the current line\nline 2\nline3\n\nlinen"
					}
				]
			});
		}

	})

	app.post("/cmd", (req: Request, res: Response) => {
		// response with a {data: {id: number, content: string}}
		res.send(
			{
				data: {
					"error": null,
					"output": "/cmd-execution/292"
				}
			});
	})

	app.post("/devtools/finaltry", (req: Request, res: Response) => {
		res.send(
			{
				"data": {
					"nothing": false,
					"content": {
						"id": 293,
						"cmdid": 64,
						"fullcmd": "start.sh",
						"envs": "{\"meta\":\"{\\\"githubWebhookSecret\\\":\\\"FEZsIOowTDpfchuhNbwC2NCJ70tmYpD2\\\"}\",\"postmeta\":{\"pm\":1,\"pm2\":{\"a\":1}}}",
						"createdAt": "2024-01-26T12:06:04.366425+08:00",
						"finishedAt": "2024-01-26T12:08:52.622719+08:00",
						"fromapi": true,
						"outputs": "total 8.0K\n-rw-r--r-- 1 appuser00000046 appuser00000046  731 Jan 25 07:09 __bashrc\ndrwx------ 2 appuser00000046 appuser00000046 4.0K Jan 25 07:09 __scripts",
						"exitcode": 0
					},
					"replaceLine": true,
					"actions": []
				}
			}
		);
	})

	///devtools/finalc?word=&line=a&clientid=
	app.get("/devtools/finalc", (req: Request, res: Response) => {
		const line = req.query.line as string
		res.send(
			{
				"data": {
					"nothing": false,
					"content": [
						{
							"label": line + " 000",
							"type": "magicwand",
							"detail": "replace the current line with this",
							"info": "new content of the current line"
						},
						{
							"label": line + " 111",
							"type": "magicwand",
							"detail": "replace the current line with this",
							"info": "new content of the current line"
						}
					],
					"replaceLine": false,
					"actions": []
				}
			}
		);
	})

	// /devtools/perclient
	app.get("/devtools/perclient", (req: Request, res: Response) => {
		const line = req.query.line as string
		res.send(
			{
				"data": {
					"completions": [
						{
							"label": "perclient 000",
							"type": "magicwand",
							"detail": "replace the current line with this",
							info: "new content of the current line\nline 2\nline3\n\nlinen"
						},
						{
							"label": "perclient 111",
							"type": "magicwand",
							"detail": "replace the current line with this",
							info: "new content of the current line\nline 2\nline3\n\nlinen"
						}
					],
					"snippets": [
						{
							"label": "snippet 222",
							"type": "magicwand",
							"detail": "replace the current line with this 000",
							"info": "new content of the current line"
						},
						{
							"label": "snippet 333",
							"type": "magicwand",
							"detail": "replace the current line with this 111",
							"info": "new content of the current line"
						}
					]
				}
			}
		);
	})

	app.get("/action/set-value", (req: Request, res: Response) => {
		const selector = req.query.selector as string
		const item: ResponseDataItem = { action: 'SET_VALUE', params: { selector, value: 'fromserver' } }
		res.send(
			{
				data: [item]
			}
		);
	})

	app.get("/action/replace-node", (req: Request, res: Response) => {
		const selector = req.query.selector as string
		const html = `
				<div>
				{{#names}}
				<p>{{.}}</p>
				{{/names}}
				</div>
		`
		const item: ResponseDataItem = { action: 'REPLACE_NODE', params: { selector, html, model: { names: ["aname", "bname"] } } }
		res.send(
			{
				data: [item]
			}
		);
	})

	app.get("/page", (req: Request, res: Response) => {
		// X-Requested-With
		if (req.header('X-Requested-With') === 'XMLHttpRequest') {
			const item = { action: 'PUSH_STATE', params: { url: req.url } } as ResponseDataItem
			const data: ResponseDataItem[] = [item]
			res.send({ data });
			return
		} else {
			res.sendFile(path.resolve('public/page.html'));
		}
	})

	app.get("/pages/:name", (req: Request, res: Response) => {
		let name = req.params.name
		if (!name.endsWith('.html')) {
			name = name + '.html'
		}
		res.sendFile(path.resolve(`public/pages/${name}`));
	})

	app.post("/pages/form-1", (req: Request, res: Response) => {
		// response all headers and body
		// body is json
		console.log(req.body)
		res.send(
			{
				headers: req.headers,
				body: req.body
			}
		);
	})

	// return index.html if no router matched

	app.get('*', (req, res) => {
		res.sendFile(path.resolve('public/index.html'));
	});


	app.listen(port, () => {
		console.log(`[server]: Server is running at http://localhost:${port}`);
	});
} 