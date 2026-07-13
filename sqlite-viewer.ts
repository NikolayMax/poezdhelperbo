import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve('data/bot.db'));
const app = express();

app.get('/', (_req, res) => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  let html = '<h1>🗄️ SQLite Viewer</h1><ul>';
  for (const t of tables) {
    const count = (db.prepare(`SELECT COUNT(*) as cnt FROM "${t.name}"`).get() as { cnt: number }).cnt;
    html += `<li><a href="/table/${t.name}">${t.name}</a> (${count})</li>`;
  }
  html += '</ul><hr><pre>data/bot.db</pre>';
  res.send(html);
});

app.get('/table/:name', (req, res) => {
  const { name } = req.params;
  try {
    const validTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    if (!validTables.some((t) => t.name === name)) {
      res.status(404).send('Table not found');
      return;
    }
    const rows = db.prepare(`SELECT * FROM "${name}"`).all() as Record<string, unknown>[];
    const cols = rows.length ? Object.keys(rows[0]!) : [];
    let html = `<h1>${name}</h1><a href="/">← Назад</a><hr><table border="1" cellpadding="6" style="border-collapse:collapse"><tr bgcolor="#f0f0f0">`;
    html += cols.map(c => `<th>${c}</th>`).join('');
    html += '</tr>';
    for (const row of rows) {
      html += '<tr>' + cols.map(c => `<td>${JSON.stringify(row[c] ?? 'NULL')}</td>`).join('') + '</tr>';
    }
    html += `</table><p>${rows.length} rows</p>`;
    res.send(html);
  } catch {
    res.status(404).send('Table not found');
  }
});

app.listen(3000, () => console.log('✅ http://localhost:3000'));
