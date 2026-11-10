import { initialTasks, validate, addTask, removeTask, toggleTask, filterTasks, summarize } from './domain.mjs';

const form = document.querySelector('#new-task');
const fields = [form.elements.title, form.elements.hours];
const filters = document.querySelector('#filters');
const list = document.querySelector('#tasks');
const template = document.querySelector('#task-row');
const empty = document.querySelector('#empty');
const hoursFormat = new Intl.NumberFormat('ru-RU');

let tasks = initialTasks();
let mode = 'all';

function updateView() {
  const { total, done, percent } = summarize(tasks);
  document.querySelector('#total').textContent = `${hoursFormat.format(total)} ч`;
  document.querySelector('#done').textContent = `${hoursFormat.format(done)} ч`;
  document.querySelector('#percent').textContent = `${percent}%`;
  document.querySelector('#progress').value = percent;

  const visible = filterTasks(tasks, mode);
  const rows = visible.map(task => {
    const row = template.content.firstElementChild.cloneNode(true);
    row.dataset.id = task.id;
    row.querySelector('input').checked = task.done;
    row.querySelector('span').textContent = task.title;
    row.querySelector('small').textContent = `${hoursFormat.format(task.hours)} ч`;
    row.querySelector('button').setAttribute('aria-label', `Удалить задачу «${task.title}»`);
    return row;
  });
  list.replaceChildren(...rows);
  empty.hidden = visible.length !== 0;
  empty.textContent = tasks.length ? 'Под этим фильтром задач нет.' : 'Задач пока нет.';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const [title, hours] = fields.map(field => field.value);
  const errors = validate(title, hours);
  for (const field of fields) {
    field.setAttribute('aria-invalid', String(field.name in errors));
    document.getElementById(`${field.name}-error`).textContent = errors[field.name] ?? '';
  }
  const invalid = fields.find(field => field.name in errors);
  if (invalid) {
    invalid.focus();
    return;
  }
  tasks = addTask(tasks, title, hours);
  form.reset();
  fields[0].focus();
  updateView();
});

filters.addEventListener('change', event => {
  mode = event.target.value;
  updateView();
});

list.addEventListener('change', event => {
  const row = event.target.closest('li');
  tasks = toggleTask(tasks, row.dataset.id);
  updateView();
});

list.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  tasks = removeTask(tasks, button.closest('li').dataset.id);
  updateView();
});

updateView();
