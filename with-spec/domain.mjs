export function initialTasks() {
  return [
    { id: 1, title: 'Чтение', hours: 2, done: true },
    { id: 2, title: 'Практика', hours: 4, done: false },
    { id: 3, title: 'Повторение', hours: 2, done: false },
  ];
}

export function validate(title, hours) {
  const errors = {};
  const input = hours.trim();
  const amount = Number(input.replace(',', '.'));

  if (title.trim() === '') {
    errors.title = 'Введите название задачи.';
  }
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(input) ||
      amount < 0.5 || amount > 24 || !Number.isInteger(amount * 2)) {
    errors.hours = 'Введите от 0,5 до 24 часов с шагом 0,5.';
  }
  return errors;
}

export function addTask(tasks, title, hours) {
  const errors = validate(title, hours);
  if (errors.title || errors.hours) return tasks;

  const id = tasks.reduce((last, task) => Math.max(last, task.id), 0) + 1;
  return [...tasks, { id, title: title.trim(), hours: Number(hours.trim().replace(',', '.')), done: false }];
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}

export function toggleTask(tasks, id) {
  return tasks.map(task => {
    if (task.id === id) return { ...task, done: !task.done };
    return task;
  });
}

export function filterTasks(tasks, mode) {
  if (mode === 'active') return tasks.filter(task => !task.done);
  if (mode === 'done') return tasks.filter(task => task.done);
  return tasks;
}

export function summarize(tasks) {
  let total = 0;
  let done = 0;
  for (const task of tasks) {
    total += task.hours;
    if (task.done) done += task.hours;
  }
  return { total, done, percent: total === 0 ? 0 : Math.round(100 * done / total) };
}
