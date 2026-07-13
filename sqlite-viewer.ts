import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve('data/bot.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  let html = '<h1>🗄️ SQLite Viewer</h1><ul>';
  for (const t of tables) {
    const count = (db.prepare(`SELECT COUNT(*) as cnt FROM "${t.name}"`).get() as { cnt: number }).cnt;
    html += `<li><a href="/table/${t.name}">${t.name}</a> (${count})</li>`;
  }
  html += '</ul>';
  html += `<button onclick="if(confirm('Очистить ВСЕ таблицы?')) fetch('/clear-all',{method:'POST'}).then(()=>location.reload())" style="color:red">🗑 Очистить все таблицы</button>`;
  html += '<hr><pre>data/bot.db</pre>';
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
    let html = `<h1>${name}</h1><a href="/">← Назад</a>`;
    html += ` <button onclick="if(confirm('Очистить таблицу ${name}?')) fetch('/clear/${name}',{method:'POST'}).then(()=>location.reload())" style="color:red">🗑 Очистить таблицу</button>`;
    html += `<hr><table border="1" cellpadding="6" style="border-collapse:collapse"><tr bgcolor="#f0f0f0">`;
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

app.post('/clear-all', (_req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    for (const t of tables) {
      db.prepare(`DELETE FROM "${t.name}"`).run();
    }
    db.prepare('DELETE FROM sqlite_sequence').run();
    db.pragma('wal_checkpoint(TRUNCATE)');
    res.redirect('/');
  } catch (err: any) {
    console.error('[CLEAR-ALL ERROR]', err?.message ?? err);
    res.status(500).send('Failed to clear tables');
  }
});

app.post('/clear/:name', (req, res) => {
  const { name } = req.params;
  try {
    const validTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    if (!validTables.some((t) => t.name === name)) {
      res.status(404).send('Table not found');
      return;
    }
    db.prepare(`DELETE FROM "${name}"`).run();
    db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(name);
    db.pragma('wal_checkpoint(TRUNCATE)');
    res.redirect(`/table/${name}`);
  } catch (err: any) {
    console.error('[CLEAR ERROR]', err?.message ?? err);
    res.status(500).send('Failed to clear table');
  }
});

app.listen(3000, () => console.log('✅ http://localhost:3000'));
