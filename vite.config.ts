import { defineConfig, loadEnv } from 'vite'

// Переменные сборки:
//   VITE_BASE          — подпапка на хостинге ('/' на домене)
//   VITE_NOINDEX=1     — демо: noindex
//   VITE_FORM_ENDPOINT — адрес приёма заявок (FormSubmit AJAX), по умолчанию info@caspol.ru
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const noindex = env.VITE_NOINDEX === '1' || command === 'serve'
  return {
    base: env.VITE_BASE || '/',
    server: { fs: { strict: false } }, // node_modules — ссылка на общий каталог
    plugins: [{
      name: 'robots',
      transformIndexHtml: (html: string) => html.replace('%ROBOTS%', noindex ? '<meta name="robots" content="noindex, nofollow">' : ''),
    }],
  }
})
