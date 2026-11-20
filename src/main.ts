import '@fontsource-variable/geologica' // шрифт со своего сервера, без Google Fonts
import './style.css'
import { animate, inView, scroll } from 'motion'

document.documentElement.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

// ── появление блоков при прокрутке ──
if (!reduce) {
  inView('[data-reveal]', (el) => {
    animate(el, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
  }, { amount: 0.18 })
}

// ── тара на первом экране чуть отстаёт от прокрутки (только компьютер) ──
const pack = document.getElementById('hero-pack')
if (pack && !reduce && matchMedia('(min-width: 901px)').matches) {
  scroll(animate(pack, { transform: ['translateY(0px)', 'translateY(-46px)'] }, { ease: 'linear' }), {
    target: document.getElementById('top')!, offset: ['start start', 'end start'],
  })
}

// ── вкладки тары: карточка перекрашивается, тара меняется ──
type Tara = 'drum' | 'cube'
const TARA: Record<Tara, { tone: string; name: string; desc: string; chips: string[]; btn: string; want: string }> = {
  drum: {
    tone: 'var(--ta)', name: 'Бочка', desc: 'Стальная бочка 216,5&nbsp;л, масса нетто 200 или 210&nbsp;кг',
    chips: ['Крышка с&nbsp;уплотнительным кольцом', 'Перевозка до&nbsp;−30&nbsp;°С', 'Хранение 9&nbsp;месяцев'],
    btn: 'Узнать цену на&nbsp;бочки', want: 'drum',
  },
  cube: {
    tone: 'var(--tb)', name: 'Еврокуб', desc: 'IBC-контейнер, масса нетто 1000&nbsp;кг. Для крупнотоннажных поставок',
    chips: ['Крышка с&nbsp;уплотнительным кольцом', 'Перевозка до&nbsp;−30&nbsp;°С', 'Хранение 9&nbsp;месяцев'],
    btn: 'Узнать цену на&nbsp;еврокуб', want: 'cube',
  },
}
const ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>'
const tabs = [...document.querySelectorAll<HTMLButtonElement>('.tab')]
const card = document.getElementById('tara-card')!
function setTara(id: Tara, focus = false) {
  const t = TARA[id]
  tabs.forEach((b) => {
    const on = b.dataset.tara === id
    b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1
    if (on) { card.setAttribute('aria-labelledby', b.id); if (focus) b.focus() }
  })
  card.style.setProperty('--tone', t.tone)
  document.getElementById('tara-name')!.textContent = t.name
  document.getElementById('tara-desc')!.innerHTML = t.desc
  document.getElementById('tara-chips')!.innerHTML = t.chips.map((c) => `<li>${c}</li>`).join('')
  const btn = document.getElementById('tara-btn') as HTMLAnchorElement
  btn.innerHTML = t.btn + ARROW; btn.dataset.want = t.want
  document.querySelectorAll<HTMLElement>('.tv').forEach((im) => im.classList.toggle('on', im.dataset.view === id))
}
tabs.forEach((b, i) => {
  b.addEventListener('click', () => setTara(b.dataset.tara as Tara))
  b.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
    setTara(n.dataset.tara as Tara, true)
  })
})

// плашки на первом экране открывают нужную вкладку тары
document.querySelectorAll<HTMLElement>('[data-go]').forEach((el) => el.addEventListener('click', () => setTara(el.dataset.go as Tara)))

// ── кнопки ведут в заявку и сразу отмечают, что нужно ──
const WANT: Record<string, string> = { sample: 'w-sample', drum: 'w-drum', cube: 'w-cube', tech: 'w-tech' }
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-want]')
  if (!a) return
  const r = document.getElementById(WANT[a.dataset.want || ''] || '') as HTMLInputElement | null
  if (r) r.checked = true
})

// ── заявка ──
const form = document.getElementById('od-form') as HTMLFormElement
const done = document.getElementById('od-done')!
const contact = document.getElementById('od-contact') as HTMLInputElement
const agree = document.getElementById('od-agree') as HTMLInputElement
const honey = document.getElementById('od-honey') as HTMLInputElement
const err = (id: string, msg: string) => { document.getElementById(id)!.textContent = msg }
function valid() {
  const v = contact.value.trim()
  const okContact = v.replace(/\D/g, '').length >= 10 || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  contact.setAttribute('aria-invalid', String(!okContact))
  err('od-contact-e', okContact ? '' : 'Оставьте телефон или почту, чтобы мы ответили')
  err('od-agree-e', agree.checked ? '' : 'Нужно согласие на обработку данных')
  if (!okContact) contact.focus()
  return okContact && agree.checked
}
function showDone(demo: boolean) {
  form.hidden = true; done.hidden = false
  if (demo) document.getElementById('od-done-p')!.textContent = 'Это демо: заявка никуда не ушла. На боевом сайте она придёт в отдел продаж'
}
const endpoint = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim()
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!valid()) return
  if (honey.value || !endpoint) { showDone(!endpoint); return }
  const btn = form.querySelector<HTMLButtonElement>('.od-go')!
  btn.disabled = true
  const data = Object.fromEntries(new FormData(form).entries())
  try {
    const r = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, _subject: 'Заявка: КАСПУР 3000 БАЗИС', _template: 'table' }),
    })
    if (!r.ok) throw new Error(String(r.status))
    showDone(false)
  } catch {
    btn.disabled = false
    err('od-contact-e', 'Не получилось отправить. Позвоните: +7 904 040-85-55')
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
    ['sand', 'Светлая', '#E6E4DD'], ['blue', 'Синяя', '#0378A3'], ['dark', 'Тёмная', '#0C1014'],
  ]
  const root = document.documentElement
  root.classList.add('demo')
  const box = document.createElement('div')
  box.className = 'tsw'
  box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Гамма сайта')
  box.innerHTML = '<span class="tsw-l">Гамма</span>' + THEMES.map(([id, name, c]) =>
    `<button type="button" data-t="${id}" title="${name}" aria-label="${name}" style="--c:${c}"></button>`).join('') + '<b class="tsw-n"></b>'
  document.querySelector('.pill.logo')!.after(box)
  const apply = (id: string) => {
    root.dataset.t = id
    root.classList.toggle('lt', id !== 'dark' && id !== 'blue')
    box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === id)))
    box.querySelector('.tsw-n')!.textContent = THEMES.find((t) => t[0] === id)?.[1] || ''
    const u = new URL(location.href); u.searchParams.set('t', id); history.replaceState(null, '', u)
  }
  box.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-t]')
    if (b) apply(b.dataset.t!)
  })
  apply(root.dataset.t || 'lilac')
}
