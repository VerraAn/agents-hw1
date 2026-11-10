import { addTask, filterTasks, initialTasks, removeTask, summarize, toggleTask, validate } from './domain.mjs';

const form = document.querySelector('form');
const title = document.querySelector('#title');
const hours = document.querySelector('#hours');
const filter = document.querySelector('#filter');
const list = document.querySelector('#tasks');
const formatHours = new Intl.NumberFormat('ru-RU');
let tasks = initialTasks();

function render() {
  const stats = summarize(tasks);
  document.querySelector('#stats').textContent =
    `Всего ${formatHours.format(stats.total)} ч · Готово ${formatHours.format(stats.done)} ч · ${stats.percent}%`;
  document.querySelector('#progress').value = stats.percent;

  const visible = filterTasks(tasks, filter.value);
  list.replaceChildren();
  document.querySelector('#empty').hidden = visible.length > 0;
  for (const task of visible) {
    const row = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      tasks = toggleTask(tasks, task.id);
      render();
    });
    const name = document.createElement('span');
    name.textContent = `${task.title} · ${formatHours.format(task.hours)} ч`;
    label.append(checkbox, name);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Удалить';
    remove.setAttribute('aria-label', `Удалить: ${task.title}`);
    remove.addEventListener('click', () => {
      tasks = removeTask(tasks, task.id);
      render();
    });
    row.append(label, remove);
    list.append(row);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const errors = validate(title.value, hours.value);
  for (const input of [title, hours]) {
    const error = errors[input.id];
    input.setAttribute('aria-invalid', String(Boolean(error)));
    document.querySelector(`#${input.id}-error`).textContent = error ?? '';
  }
  if (errors.title || errors.hours) {
    (errors.title ? title : hours).focus();
    return;
  }
  tasks = addTask(tasks, title.value, hours.value);
  form.reset();
  title.focus();
  render();
});

filter.addEventListener('change', render);
render();
