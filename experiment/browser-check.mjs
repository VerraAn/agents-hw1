import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pages = {};
for (const version of ['direct', 'with-spec']) {
  const read = filename => readFile(new URL(`${version}/${filename}`, root), 'utf8');
  const [html, css, domain, app] = await Promise.all(
    ['index.html', 'styles.css', 'domain.mjs', 'app.mjs'].map(read),
  );
  const script = domain.replace(/^export /gm, '') + '\n' + app.replace(/^import .+;\r?\n/m, '');
  pages[version] = html
    .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`)
    .replace(/<script type="module"[^>]*><\/script>/, '')
    .replace('</body>', () => `<script>${script}</script></body>`);
}

const code = String.raw`
const results = document.querySelector('#results');
const say = line => {
  const output = document.createElement('div');
  output.textContent = line;
  results.append(output);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
function pageIn(frame, version) {
  return new Promise(resolve => {
    frame.addEventListener('load', () => resolve(frame.contentDocument), { once: true });
    frame.srcdoc = pages[version];
  });
}
function inspect(doc, version) {
  const query = selector => doc.querySelector(selector);
  const rows = () => [...doc.querySelectorAll('#tasks li')];
  const setFilter = mode => {
    if (version === 'direct') {
      query('#filter').value = mode;
      query('#filter').dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      query('input[name=filter][value=' + mode + ']').click();
    }
  };
  const metrics = () => version === 'direct'
    ? query('#stats').textContent.match(/[\d,]+/g).map(value => Number(value.replace(',', '.')))
    : ['#total', '#done', '#percent'].map(selector => Number(query(selector).textContent.match(/[\d,]+/)[0].replace(',', '.')));
  const expectMetrics = (total, done, percent) => {
    const actual = metrics();
    assert(actual.join() === [total, done, percent].join(), 'Метрики: ' + actual);
    assert(query('progress').value === percent, 'Индикатор прогресса');
  };
  const findRow = title => rows().find(row => row.querySelector('label').textContent.includes(title));
  assert(rows().length === 3 && findRow('Чтение').querySelector('input').checked, 'Исходные задачи');
  expectMetrics(8, 2, 25);
  say('T1 · 3 задачи, 2/8 ч, 25%');

  findRow('Практика').querySelector('input').click();
  expectMetrics(8, 6, 75);
  assert(findRow('Практика').querySelector('input').checked, 'Флажок Практики');
  say('T2 · Практика готова, 6/8 ч, 75%');
  findRow('Практика').querySelector('input').click();

  setFilter('active');
  assert(rows().length === 2 && findRow('Практика') && findRow('Повторение'), 'Активные');
  expectMetrics(8, 2, 25);
  setFilter('done');
  assert(rows().length === 1 && findRow('Чтение'), 'Готовые');
  expectMetrics(8, 2, 25);
  setFilter('all');
  say('T3 · активные и готовые отфильтрованы, общие итоги сохранены');

  const title = query('#title');
  const hours = query('#hours');
  const add = query('button[type=submit]');
  for (const [name, value, field] of [
    ['', '2', 'title'], ['   ', '2', 'title'], ['Тест', '', 'hours'],
    ['Тест', '-1', 'hours'], ['Тест', '0,25', 'hours'],
    ['Тест', '1,1', 'hours'], ['Тест', '24,5', 'hours'],
  ]) {
    title.value = name;
    hours.value = value;
    add.click();
    assert(rows().length === 3, 'Некорректная задача добавлена');
    const error = doc.getElementById(field + '-error');
    assert(error.textContent.length > 0 && error.getBoundingClientRect().height > 0, 'Сообщение об ошибке');
    assert(title.value === name && hours.value === value, 'Ввод потерян');
  }
  for (const [name, value, count] of [['Нижняя граница', '0,5', 4], ['Верхняя граница', '24', 5]]) {
    title.value = name;
    hours.value = value;
    add.click();
    assert(rows().length === count && findRow(name), 'Допустимое значение отклонено');
  }
  expectMetrics(32.5, 2, 6);
  say('T4 · 7 неверных вводов отклонены с ошибкой; 0,5 и 24 приняты');

  while (rows().length) {
    const before = rows().length;
    rows()[0].querySelector('button').click();
    assert(rows().length === before - 1, 'Удаление');
  }
  expectMetrics(0, 0, 0);
  assert(!query('#empty').hidden, 'Пустое состояние');
  title.value = 'Задача после очистки';
  hours.value = '1';
  add.click();
  assert(rows().length === 1, 'Повторное добавление');
  say('T5 · 0 ч и 0%; пустой список; повторное добавление работает');

  const width = doc.documentElement.clientWidth;
  const scroll = doc.documentElement.scrollWidth;
  assert(width === 390 && scroll === width, 'Ширина ' + width + ', прокрутка ' + scroll);
  assert(title.labels.length === 1 && hours.labels.length === 1 && add.textContent.trim(), 'Подписи');
  say('UI · ширина ' + width + ' px, scrollWidth ' + scroll + ' px, подписи есть');
}
(async () => {
  for (const version of ['direct', 'with-spec']) {
    say(version);
    const frame = document.getElementById(version);
    try {
      inspect(await pageIn(frame, version), version);
      say('ИТОГ: PASS');
    } catch (error) {
      say('ИТОГ: FAIL · ' + error.message);
    }
    await pageIn(frame, version);
  }
})();
`;
await writeFile(new URL('browser-check.html', root), `<!doctype html>
<html lang="ru"><meta charset="utf-8"><title>ДЗ 1 — проверка интерфейса</title>
<style>body {font: 15px system-ui; margin: 16px; color: #18212c;} #results {display: grid; grid-template-columns: repeat(2, minmax(0, 390px)); gap: 0 12px; font-size: 13px;} #results div {grid-column: 1 / -1;} #results div:nth-child(8n + 1) {font-weight: 700; margin-top: 6px;} section {display: flex; flex-wrap: wrap; gap: 10px;} iframe {display: block; width: 390px; height: 710px; border: 1px solid #c5ccd4;} h2 {font-size: 1rem;}</style>
<h1>Проверка двух реализаций</h1><div id="results"></div>
<section><div><h2>direct</h2><iframe id="direct" title="direct"></iframe></div><div><h2>with-spec</h2><iframe id="with-spec" title="with-spec"></iframe></div></section>
<script>const pages = ${JSON.stringify(pages).replaceAll('<', '\\u003c')};\n${code}</script></html>`);
