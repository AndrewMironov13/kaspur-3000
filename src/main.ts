import '@fontsource-variable/geologica' // шрифт со своего сервера, без Google Fonts
import './style.css'

// ── кнопки ведут в заявку и сразу отмечают, что нужно ──
const WANT: Record<string, string> = { sample: 'w-sample', drum: 'w-drum', cube: 'w-cube', tech: 'w-tech' }
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-want]')
  if (!a) return
  const r = document.getElementById(WANT[a.dataset.want || ''] || '') as HTMLInputElement | null
  if (r) {
    r.checked = true
    syncTechField()
  }
})

const tech = document.getElementById('w-tech') as HTMLInputElement
const techField = document.getElementById('tech-field')!
const question = document.getElementById('od-question') as HTMLTextAreaElement
function syncTechField() {
  techField.hidden = !tech.checked
  question.disabled = !tech.checked
}
document.querySelector('.od-set')!.addEventListener('change', syncTechField)
window.addEventListener('pageshow', syncTechField)
syncTechField()

// ── заявка ──
const form = document.getElementById('od-form') as HTMLFormElement
const done = document.getElementById('od-done')!
const contact = document.getElementById('od-contact') as HTMLInputElement
const agree = document.getElementById('od-agree') as HTMLInputElement
const honey = document.getElementById('od-honey') as HTMLInputElement
const reset = document.getElementById('od-reset') as HTMLButtonElement
const submit = form.querySelector<HTMLButtonElement>('.od-go')!
const err = (id: string, msg: string) => { document.getElementById(id)!.textContent = msg }
function valid() {
  const v = contact.value.trim()
  const digits = v.replace(/\D/g, '').length
  const okContact = (/^\+?[\d\s().-]+$/.test(v) && digits >= 10 && digits <= 15) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  contact.setAttribute('aria-invalid', String(!okContact))
  err('od-contact-e', okContact ? '' : 'Оставьте телефон или почту, чтобы мы ответили')
  err('od-agree-e', agree.checked ? '' : 'Нужно согласие на обработку данных')
  agree.setAttribute('aria-invalid', String(!agree.checked))
  if (!okContact) contact.focus()
  else if (!agree.checked) agree.focus()
  return okContact && agree.checked
}
function showDone(demo: boolean) {
  form.hidden = true; done.hidden = false
  done.querySelector('h3')!.textContent = demo ? 'Форма проверена' : 'Заявка отправлена'
  if (demo) document.getElementById('od-done-p')!.textContent = 'Проверка завершена. В деморежиме данные остаются в браузере'
  reset.hidden = false
  done.tabIndex = -1; done.focus({ preventScroll: true })
  done.scrollIntoView({ block: 'center' })
}
const endpoint = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim()
if (!endpoint) {
  document.getElementById('demo-notice')!.hidden = false
  submit.firstChild!.textContent = 'Проверить форму'
}
reset.addEventListener('click', () => {
  done.hidden = true; reset.hidden = true; form.hidden = false
  contact.focus()
})
contact.addEventListener('input', () => {
  if (contact.getAttribute('aria-invalid') === 'true') {
    contact.removeAttribute('aria-invalid'); err('od-contact-e', '')
  }
})
agree.addEventListener('change', () => {
  agree.removeAttribute('aria-invalid'); err('od-agree-e', '')
})
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!valid()) return
  if (honey.value) return
  if (!endpoint) { showDone(true); return }
  submit.disabled = true
  submit.firstChild!.textContent = 'Отправляем…'
  form.setAttribute('aria-busy', 'true')
  const data = Object.fromEntries(new FormData(form).entries())
  data.contact = contact.value.trim()
  try {
    const r = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, _subject: 'Заявка: КАСПУР 3000 БАЗИС', _template: 'table' }),
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) throw new Error(String(r.status))
    showDone(false)
  } catch {
    err('od-contact-e', 'Не получилось отправить. Позвоните: +7 (950) 347-01-96')
  } finally {
    submit.disabled = false
    submit.firstChild!.textContent = 'Отправить заявку'
    form.removeAttribute('aria-busy')
  }
})

// ── шапка: над тёмным первым экраном пилюли прозрачные ──
const hd = document.getElementById('hd')!
new IntersectionObserver(([en]) => hd.classList.toggle('dark', en.isIntersecting), { rootMargin: '-70px 0px 0px 0px', threshold: 0 }).observe(document.getElementById('top')!)

// ── кнопка внизу экрана на телефоне: появляется после первого экрана, прячется у формы ──
const mbar = document.getElementById('mbar')!
const hero = document.getElementById('top')!
const order = document.getElementById('order')!
let heroOut = false, orderIn = false
const sync = () => mbar.classList.toggle('on', heroOut && !orderIn)
new IntersectionObserver(([en]) => { heroOut = !en.isIntersecting; sync() }, { threshold: 0.05 }).observe(hero)
// у формы и в подвале кнопка не нужна
const seen = new Set<Element>()
const io = new IntersectionObserver((ens) => { ens.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target))); orderIn = seen.size > 0; sync() }, { threshold: 0.05 })
io.observe(order); io.observe(document.querySelector('.ft')!)

// ── только в демо: переключатель гамм, чтобы сравнить варианты на одной ссылке ──
if (import.meta.env.DEV || import.meta.env.VITE_DEMO === '1') {
  const THEMES: [string, string, string][] = [
    ['lilac', 'Сиреневая', '#CCD2EA'], ['rose', 'Розовая', '#E9CDC8'], ['olive', 'Оливковая', '#D2D1AA'],
    ['sand', 'Светлая', '#E6E4DD'], ['blue', 'Синяя', '#0378A3'],
  ]
  const root = document.documentElement
  root.classList.add('demo')
  const options = document.createElement('details')
  options.className = 'demo-options'
  options.innerHTML = '<summary>Варианты гаммы для согласования</summary>'
  const box = document.createElement('div')
  box.className = 'tsw'
  box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Гамма сайта')
  box.innerHTML = THEMES.map(([id, name, c]) =>
    `<button type="button" data-t="${id}" aria-label="${name}" style="--c:${c}"><span></span>${name}</button>`).join('')
  options.append(box)
  document.getElementById('demo-options')!.append(options)
  const apply = (id: string) => {
    root.dataset.t = id
    root.classList.toggle('lt', id !== 'dark' && id !== 'blue')
    box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === id)))
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content = THEMES.find((t) => t[0] === id)?.[2] || '#0C1014'
    const u = new URL(location.href); u.searchParams.set('t', id); history.replaceState(null, '', u)
  }
  box.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-t]')
    if (b) apply(b.dataset.t!)
  })
  apply(root.dataset.t || 'lilac')
}
