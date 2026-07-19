import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { Bot } from '@maxhub/max-bot-api';

function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch {
                resolve(null);
            }
        });
        req.on('error', reject);
    });
}

export function startWebhookServer(bot: Bot, port: number, secret?: string) {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === 'POST') {
            const webhookSecret = req.headers['x-max-bot-api-secret'];

            if (secret && webhookSecret !== secret) {
                console.error('[WEBHOOK] Invalid secret');
                res.writeHead(401);
                res.end('Unauthorized');
                return;
            }

            const body = await parseBody(req);
            if (body) {
                (bot as any).handleUpdate(body).catch((err: any) => {
                    console.error('[WEBHOOK] Handle error:', err?.message ?? err);
                });
            }

            res.writeHead(200);
            res.end('ok');
            return;
        }

        res.writeHead(200);
        res.end('Tuda-Suda webhook running');
    });

    server.listen(port, () => {
        console.log(`[WEBHOOK] Server listening on port ${port}`);
    });

    return server;
}
