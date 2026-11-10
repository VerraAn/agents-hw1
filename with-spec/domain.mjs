const seed = [
  { id: 'reading', title: 'Чтение', hours: 2, done: true },
  { id: 'practice', title: 'Практика', hours: 4, done: false },
  { id: 'review', title: 'Повторение', hours: 2, done: false },
];

export function initialTasks() {
  return seed.map(task => ({ ...task }));
}

export function validate(title, hours) {
  const errors = {};
  const input = hours.trim();
  const number = Number(input.replace(',', '.'));

  if (title.trim().length === 0) errors.title = 'Напишите название задачи.';
  if (!/^\d+(?:[.,]\d+)?$/.test(input) || number < 0.5 || number > 24 || !Number.isInteger(number * 2)) {
    errors.hours = 'Укажите от 0,5 до 24 часов с шагом 0,5.';
  }
  return errors;
}

export function addTask(tasks, title, hours) {
  const errors = validate(title, hours);
  if (errors.title || errors.hours) return tasks;
  let next = tasks.length + 1;
  const used = new Set(tasks.map(task => task.id));
  while (used.has(`task-${next}`)) next += 1;
  return tasks.concat({ id: `task-${next}`, title: title.trim(), hours: Number(hours.trim().replace(',', '.')), done: false });
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
  if (mode === 'all') return tasks;
  return tasks.filter(task => task.done === (mode === 'done'));
}

export function summarize(tasks) {
  const total = tasks.reduce((sum, task) => sum + task.hours, 0);
  const done = tasks.reduce((sum, task) => sum + (task.done ? task.hours : 0), 0);
  const percent = total === 0 ? 0 : Math.round(100 * done / total);
  return { total, done, percent };
}
