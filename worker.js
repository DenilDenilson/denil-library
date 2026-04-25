function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('es-PE');
}

function getIcon(name) {
  const ext = name.split('.').pop().toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (['epub', 'mobi'].includes(ext)) return 'Epub';
  if (['jpg', 'png', 'webp'].includes(ext)) return 'Image';
  if (['zip', 'rar'].includes(ext)) return 'Zip';

  return '---';
}

function renderHTML(objects) {
  const files = objects.objects || [];

  const items = files.map(file => `
    <div class="card">
      <div class="icon">${getIcon(file.key)}</div>
      <div class="info">
        <h3>${file.key}</h3>
        <p>${formatBytes(file.size)} · ${formatDate(file.uploaded)}</p>
      </div>
    </div>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Denil Library</title>

    <style>
      body {
        margin: 0;
        font-family: system-ui;
        background: linear-gradient(135deg, #f3f7f2, #e6f3ea);
        color: #1a1a1a;
      }

      header {
        padding: 40px;
      }

      h1 {
        margin: 0;
        font-size: 48px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        padding: 20px;
      }

      .card {
        background: white;
        border-radius: 16px;
        padding: 16px;
        display: flex;
        gap: 12px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        transition: 0.2s;
      }

      .card:hover {
        transform: translateY(-3px);
      }

      .icon {
        font-size: 28px;
      }

      .info h3 {
        margin: 0;
        font-size: 14px;
        word-break: break-all;
      }

      .info p {
        margin: 4px 0 0;
        font-size: 12px;
        color: #666;
      }

      .empty {
        text-align: center;
        padding: 40px;
        color: #666;
      }
    </style>
  </head>

  <body>
    <header>
      <h1>📚 Denil Library</h1>
      <p>${files.length} archivos</p>
    </header>

    ${
      files.length
        ? `<div class="grid">${items}</div>`
        : `<div class="empty">No hay archivos aún</div>`
    }

  </body>
  </html>
  `;
}

export default {
  async fetch(request, env) {
    const objects = await env.MY_BUCKET.list();

    return new Response(renderHTML(objects), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
