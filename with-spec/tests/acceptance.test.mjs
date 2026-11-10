import assert from 'node:assert/strict';
import test from 'node:test';
import { addTask, filterTasks, initialTasks, removeTask, summarize, toggleTask, validate } from '../domain.mjs';

test('T1 · исходные данные и прогресс по часам', () => {
  const tasks = initialTasks();
  assert.deepEqual(tasks.map(({ title, hours, done }) => [title, hours, done]), [
    ['Чтение', 2, true], ['Практика', 4, false], ['Повторение', 2, false],
  ]);
  assert.equal(new Set(tasks.map(task => task.id)).size, 3);
  assert.deepEqual(summarize(tasks), { total: 8, done: 2, percent: 25 });
  const extra = addTask(tasks, '  Конспект  ', '0.5');
  assert.equal(extra.length, 4);
  assert.deepEqual(extra.at(-1).title, 'Конспект');
  assert.equal(extra.at(-1).hours, 0.5);
  assert.equal(extra.at(-1).done, false);
  assert.equal(new Set(extra.map(task => task.id)).size, 4);
});

test('T2 · переключение статуса меняет 25% на 75% и обратно', () => {
  let tasks = initialTasks();
  const practice = tasks.find(task => task.title === 'Практика');
  tasks = toggleTask(tasks, practice.id);
  assert.equal(tasks.find(task => task.id === practice.id).done, true);
  assert.deepEqual(summarize(tasks), { total: 8, done: 6, percent: 75 });
  tasks = toggleTask(tasks, practice.id);
  assert.deepEqual(summarize(tasks), { total: 8, done: 2, percent: 25 });
});

test('T3 · фильтры меняют только список', () => {
  const tasks = initialTasks();
  assert.deepEqual(filterTasks(tasks, 'active').map(task => task.title), ['Практика', 'Повторение']);
  assert.deepEqual(filterTasks(tasks, 'done').map(task => task.title), ['Чтение']);
  assert.equal(filterTasks(tasks, 'all').length, 3);
  assert.deepEqual(summarize(tasks), { total: 8, done: 2, percent: 25 });
});

test('T4 · пустые поля, границы и шаг', () => {
  const tasks = initialTasks();
  for (const title of ['', '   ']) {
    assert.ok(validate(title, '2').title);
    assert.equal(addTask(tasks, title, '2').length, 3);
  }
  for (const hours of ['', '  ', '-1', '0', '0.25', '1.1', '24.5', 'abc', 'Infinity']) {
    assert.ok(validate('Конспект', hours).hours, JSON.stringify(hours));
    assert.equal(addTask(tasks, 'Конспект', hours).length, 3);
  }
  for (const hours of ['0.5', '1', '23.5', '24']) {
    assert.deepEqual(validate('Конспект', hours), {});
    assert.equal(addTask(tasks, 'Конспект', hours).at(-1).hours, Number(hours));
  }
});

test('T5 · удаление всех задач и повторное добавление', () => {
  let tasks = initialTasks();
  for (const task of tasks) tasks = removeTask(tasks, task.id);
  assert.deepEqual(tasks, []);
  assert.deepEqual(summarize(tasks), { total: 0, done: 0, percent: 0 });
  assert.deepEqual(summarize(addTask(tasks, 'Новая задача', '1')), { total: 1, done: 0, percent: 0 });
});
