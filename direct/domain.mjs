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
  const value = Number(input.replace(',', '.'));
  if (!title.trim()) errors.title = 'Введите название задачи.';
  if (!/^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(input) || value < 0.5 || value > 24 || value % 0.5 !== 0) {
    errors.hours = 'Введите число от 0,5 до 24 с шагом 0,5.';
  }
  return errors;
}

export function addTask(tasks, title, hours) {
  const errors = validate(title, hours);
  if (errors.title || errors.hours) return tasks;
  const id = Math.max(0, ...tasks.map(task => task.id)) + 1;
  return [...tasks, { id, title: title.trim(), hours: Number(hours.trim().replace(',', '.')), done: false }];
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}

export function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
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
  return { total, done, percent: total ? Math.round(100 * done / total) : 0 };
}
