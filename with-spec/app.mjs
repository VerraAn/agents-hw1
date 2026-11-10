import { initialTasks, validate, addTask, removeTask, toggleTask, filterTasks, summarize } from './domain.mjs';

const form = document.querySelector('form');
const titleField = form.elements.title;
const hoursField = form.elements.hours;
const list = document.querySelector('#tasks');
const rowTemplate = document.querySelector('#row');
const filters = document.querySelector('#filters');
const number = new Intl.NumberFormat('ru-RU');

let tasks = initialTasks();

function render() {
  const totals = summarize(tasks);
  document.querySelector('#total').textContent = `${number.format(totals.total)} ч`;
  document.querySelector('#done').textContent = `${number.format(totals.done)} ч`;
  document.querySelector('#percent').textContent = `${totals.percent}%`;
  document.querySelector('#progress').value = totals.percent;

  const visible = filterTasks(tasks, filters.querySelector(':checked').value);
  list.replaceChildren();
  for (const task of visible) {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.id = task.id;
    row.querySelector('input').checked = task.done;
    row.querySelector('label span').textContent = task.title;
    row.querySelector('.task-hours').textContent = `${number.format(task.hours)} ч`;
    row.querySelector('button').setAttribute('aria-label', `Удалить: ${task.title}`);
    list.append(row);
  }

  const empty = document.querySelector('#empty');
  empty.hidden = visible.length !== 0;
  empty.textContent = tasks.length ? 'В этой группе задач нет.' : 'Задач пока нет.';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const errors = validate(titleField.value, hoursField.value);
  for (const field of [titleField, hoursField]) {
    const message = errors[field.name] ?? '';
    field.setAttribute('aria-invalid', String(Boolean(message)));
    document.getElementById(`${field.id}-error`).textContent = message;
  }
  if (errors.title || errors.hours) {
    (errors.title ? titleField : hoursField).focus();
    return;
  }

  tasks = addTask(tasks, titleField.value, hoursField.value);
  form.reset();
  titleField.focus();
  render();
});

filters.addEventListener('change', render);
list.addEventListener('change', event => {
  tasks = toggleTask(tasks, Number(event.target.closest('li').dataset.id));
  render();
});
list.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  tasks = removeTask(tasks, Number(button.closest('li').dataset.id));
  render();
});
render();
