const BOOKS_BASE_URL = 'https://books.denil.org';

const GROUPS = {
  HW: {
    title: 'Hardware',
    description: 'Electrónica, circuitos, PCB y sistemas físicos.',
  },
  FW: {
    title: 'Firmware',
    description: 'Microcontroladores, C embebido, drivers.',
  },
  SW: {
    title: 'Software',
    description: 'Programación, sistemas, backend y Linux.',
  },
  OT: {
    title: 'Otros',
    description: 'Archivos sin prefijo.',
  },
};

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

function getFileName(key = '') {
  return key.split('/').pop();
}

function getPublicUrl(key) {
  return `${BOOKS_BASE_URL}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

function getPrefix(key = '') {
  const name = getFileName(key).toUpperCase();
  const match = name.match(/^([A-Z]{2})/);
  return GROUPS[match?.[1]] ? match[1] : 'OT';
}

function cleanTitle(key = '') {
  return getFileName(key)
    .replace(/^[A-Z]{2}[_-]*/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\.pdf$/i, '')
    .trim();
}

function groupFiles(files) {
  return files.reduce((acc, file) => {
    const prefix = getPrefix(file.key);
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(file);
    return acc;
  }, {});
}

function renderFile(file) {
  return `
    <li>
      <a href="${getPublicUrl(file.key)}" target="_blank">
        <strong>${cleanTitle(file.key)}</strong><br>
        <small>${file.key} · ${formatBytes(file.size)} · ${formatDate(file.uploaded)}</small>
      </a>
    </li>
  `;
}

function renderGroup(prefix, files) {
  const group = GROUPS[prefix];

  return `
    <section>
      <h2>${prefix} — ${group.title}</h2>
      <p>${group.description}</p>
      <ul>
        ${files.map(renderFile).join('')}
      </ul>
    </section>
  `;
}

function renderHTML(objects) {
  const files = objects.objects || [];
  const grouped = groupFiles(files);

  const order = ['HW', 'FW', 'SW', 'OT'];

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Denil Library</title>

    <style>
      body {
        font-family: system-ui;
        background: #f3f7f2;
        padding: 40px;
      }

      h1 {
        font-size: 48px;
      }

      section {
        margin-top: 40px;
        padding: 20px;
        background: white;
        border-radius: 12px;
      }

      ul {
        padding-left: 20px;
      }

      li {
        margin: 10px 0;
      }

      a {
        text-decoration: none;
        color: #17613b;
      }

      a:hover {
        text-decoration: underline;
      }

      small {
        color: #666;
      }
    </style>
  </head>

  <body>
    <h1>📚 Denil Library</h1>
    <p>${files.length} archivos</p>

    ${
      files.length
        ? order
            .filter(p => grouped[p])
            .map(p => renderGroup(p, grouped[p]))
            .join('')
        : '<p>No hay archivos</p>'
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
