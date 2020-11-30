const http = require('http');
const Koa = require('koa');
const Instance = require('./instance');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const Router = require('koa-router');
const WS = require('ws');

const app = new Koa();
const router = new Router();

app.use(cors());

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    text: true,
    json: true,
}));

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws, req) => {
    ws.on('message', async (msg) => {
        const message = JSON.parse(msg);

        if(message.type === 'create') {
            const instance = new Instance();
        ws.send(
            JSON.stringify({
                type: "received",
                data: {
                    date: new Date().toLocaleString(),
                    info: 'Received "Create command"',
                    id: instance.id,
                },
            })
        );

        setTimeout(async () => {
            await instance.save();
            const instances = await Instance.getAll();

            ws.send(
                JSON.stringify({
                    type: "created",
                    data: {
                        instances,
                        date: new Date().toLocaleString(),
                        info: "Created",
                        id: instance.id,
                    },
                })
            );
        }, 20000);
        return;

        } else if(message.type === 'start') {
            ws.send(
                JSON.stringify({
                    type: "received",
                    data: {
                        date: new Date().toLocaleString(),
                        info: 'Received "Start Command"',
                        id: message.data.id,
                    },
                })
            );

            setTimeout(async () => {
                await Instance.updateState(message.data.id);
                const instances = await Instance.getAll();

                ws.send(
                    JSON.stringify({
                        type: "started",
                        data: {
                            instances,
                            date: new Date().toLocaleString(),
                            info: "Created",
                            id: message.data.id,
                        },
                    })
                );
            }, 20000);
            return;

        } else if(message.type === 'stop') {
            ws.send(
                JSON.stringify({
                    type: "received",
                    data: {
                        date: new Date().toLocaleString(),
                        info: 'Received "Stop Command"',
                        id: message.data.id,
                    },
                })
            );

            setTimeout(async () => {
                await Instance.updateState(message.data.id);
                const instances = await Instance.getAll();

                ws.send(
                    JSON.stringify({
                        type: "stopped",
                        data: {
                            instances,
                            date: new Date().toLocaleString(),
                            info: "Stopped",
                            id: message.data.id,
                        },
                    })
                );
            }, 20000);
            return;

        } else if(message.type === 'delete') {
            ws.send(
                JSON.stringify({
                    type: "received",
                    data: {
                        date: new Date().toLocaleString(),
                        info: 'Received "Delete Command"',
                        id: message.data.id,
                    },
                })
            );
            setTimeout(async () => {
                await Instance.delete(message.data.id);
                const instances = await Instance.getAll();

                ws.send(
                    JSON.stringify({
                        type: "deleted",
                        data: {
                            instances,
                            date: new Date().toLocaleString(),
                            info: "Deleted",
                            id: message.data.id,
                        },
                    })
                );
            }, 20000);
            return;

        }
    })
});


router.get('/', async (ctx) => {
    ctx.response.body = await Instance.getAll();
    ctx.response.status = 200;
})


app.use(router.routes()).use(router.allowedMethods());
server.listen(port);