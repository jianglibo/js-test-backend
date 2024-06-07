import express, { Express, NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import hljs from "highlight.js";
import path from "path";
import basicAuth from 'basic-auth';
var shelljs = require("shelljs");

interface PostResponse {
	nothing: boolean
	content: string | object
	replaceLine: boolean
	actions: { name: string, [key: string]: any }[]
}

type AllActions = 'PUSH_STATE' | 'SET_VALUE' | 'APPEND_CLASSES' | 'REMOVE_NODE' | 'INSERT_HTML' | 'REDIRECT' | 'RELOAD' | 'TOAST' | 'SWAL2' | 'REPLACE_NODE'

// Define the middleware function
function copyHeaders(req: Request, res: Response, next: NextFunction) {
	// Define an array of header names to be copied
	const headersToCopy = ['Ph-Id', 'Ph-Group-Id']; // Add more headers as needed

	headersToCopy.forEach(header => {
		// Check if the header exists in the request
		// console.log(req.headers)
		if (req.header(header)) {
			// Copy the header to the response
			res.setHeader(header, req.header(header) as string);
		}
	});

	// Call the next middleware in the chain
	next();
}


interface ResponseDataItem {
	action: AllActions,
	params: { [key: string]: any }
}

export default () => {
	const app: Express = express();
	const port = process.env.EXPRESS_PORT || 3000;
	app.use(express.static('public'))
	app.use(express.json())
	app.use(copyHeaders)
	app.use(fileUpload())

	let cache: unknown = null;

	// multipart file, save to dis
	app.post('/upload', (req: Request, res: Response) => {
		if (!req.files) {
			return res.status(400).send({ error: 'No file uploaded' });
		}

		const file = req.files.file as any;
		const filename = file.name;

		file.mv(path.resolve(`public/uploads/${filename}`), (err: any) => {
			if (err) {
				// If there's an error, send an error response
				return res.status(500).send({ error: 'File upload failed', message: err.message });
			}

			// If file upload is successful, send a success response with the filename
			res.status(200).send({ data: { filename } });
		});
	});


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

	app.post("/uploadTrack", (req: Request, res: Response) => {
		// response with a {data: {id: number, content: string}}
		res.send(
			{
				data: {
					"trackid": "anuuidvalue"
				}
			});
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

	app.get("/helpers/:name/", (req: Request, res: Response) => {
		const xRequestWith = req.header('X-Requested-With')
		const isPjax = req.header('Ph-Pjax-Request')

		if (xRequestWith === 'XMLHttpRequest' && !isPjax) {
			// if (true) {

			const pageStr = (req.query.page || "1").toString()
			const sizeStr = (req.query.size || "10").toString()

			const page = parseInt(pageStr)
			const size = parseInt(sizeStr)
			console.log("page: ", page, ", size: ", size)

			const items = Array.from({ length: size }, (_, i) => {
				return {
					id: i + (page - 1) * size,
					task: `Item ${i + (page - 1) * size}`,
					dueDate: '2021-01-01',
					priority: 'high'
				}
			})
			const respData = {
				data: items
			}
			res.json(respData)
		} else {
			const name = req.params.name
			res.sendFile(path.resolve(`public/helpers/${name}.html`));
		}
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
	app.get("/pages/ajax-change", (req: Request, res: Response) => {
		res.json({
			data: [
				{
					value: 10,
					name: 'A'
				},
				{
					value: 20,
					name: 'B'
				},
				{
					value: 30,
					name: 'C'
				}
			]
		});
	})


	app.get("/pages/redirect", (req: Request, res: Response) => {
		const { url } = req.query
		res.redirect(url as string)
	})


	app.get("/pages/:name", (req: Request, res: Response) => {
		let name = req.params.name
		if (!name.endsWith('.html')) {
			name = name + '.html'
		}
		res.sendFile(path.resolve(`public/pages/${name}`));
	})

	app.get("/highlight/", (req: Request, res: Response) => {
		const content = req.query.content as string
		const lang = req.query.lang as string
		const css = req.query.css as string

		if (css) {
			const version = req.query.version || '11.9.0'
			const url = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${version}/styles/default.min.css`
			// fetch the content and return to client
			fetch(url)
				.then(response => response.text())
				.then(css => {
					res.send(css)
				})
		} else {
			const highlightedCode = hljs.highlight(
				content,
				{ language: lang }
			).value
			res.send(highlightedCode)
		}
	})


	app.get("/fixtures/data-consumer", (req: Request, res: Response) => {
		res.json({
			data: [
				{
					id: 1,
					name: 'A'
				},
				{
					id: 2,
					name: 'B'
				},
				{
					id: 3,
					name: 'C'
				}
			]
		});
	})

	app.post("/fixtures/form-submit", (req: Request, res: Response) => {
		const body = req.body
		res.json({
			"data": [
				{
					"action": "FAILED_VALIDATES",
					"params": {
						"failedValidates": [
							{
								"name": "content",
								"message": "size must be between 6 and 1048576"
							}
						]
					}
				},
				{
					"action": "TOAST",
					"params": {
						"toast": {
							"icon": "warning",
							"title": "validate failed.",
							"timer": 3000
						}
					}
				}
			]
		});
	})

	app.get("/fixtures/toast", (req: Request, res: Response) => {
		const { position, toast } = req.query
		let item
		if (toast) {
			item = {
				"action": "TOAST",
				"params": {
					"toast": {
						"position": position || "top-end",
						"icon": "warning",
						"title": "validate failed.",
						"timer": 3000
					}
				}
			}
		} else {
			item = {
				"action": "SWAL2",
				"params": {
					"swal2": {
						"icon": "info",
						"title": "Deploy Outputs",
						"text": "executing ./deploy.sh\nuser letsscript exists\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nCreate unit file: /etc/systemd/system/demoserverbg.service\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nCreate env file: /etc/demoserverbg/env\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nStart demoserverbg.service\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nlast exit code: 1\ndemoserverbg is running.\nbase64: invalid input\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nsudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required\nread process output done.\nexitCode:1",
						"wrap": "<pre><code>////</code><pre>"
					}
				}
			}
		}
		res.json(
			{
				"data": [item]
			}
		);
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

	app.get("/ng-check", (req: Request, res: Response) => {
		const credentials = basicAuth(req);
		if (credentials) {
			const { name, pass } = credentials;
			// Replace 'your_username' and 'your_password' with your actual credentials
			if (name === process.env.NG_USER && pass === process.env.NG_PASS) {
				// Authentication successful
				res.status(200).send('Authentication successful');
			}
		}
		// No authentication credentials provided
		res.statusCode = 401
		res.setHeader('WWW-Authenticate', 'Basic realm="example"')
		res.end('Access denied')
	})

	app.get('*', (req, res) => {
		res.sendFile(path.resolve('public/index.html'));
	});


	app.listen(port, () => {
		console.log(`[server]: Server is running at http://localhost:${port}`);
	});
} 
