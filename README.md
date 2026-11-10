# ДЗ № 1. Мини-трекер учебных задач

Ананьевская Вера Дмитриевна · вариант B · 10 ноября 2026

- [direct](direct/) — реализация по общему брифу.
- [with-spec](with-spec/) — реализация по [спецификации](with-spec/openspec/changes/build-tracker/).
- [Отчёт](report.md), [промпты](experiment/prompts.md) и [логи](evidence/).

## Запуск

Для быстрого просмотра откройте `browser-check.html` в Chrome. Страница без установки зависимостей показывает результат проверки и обе интерактивные версии рядом. В каждой версии стартуют три задачи. Перезагрузка восстанавливает пример.

Для запуска исходных модульных приложений из корня проекта поднимите статический сервер:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Откройте [direct](http://127.0.0.1:8080/direct/) и [with-spec](http://127.0.0.1:8080/with-spec/). Остановить сервер можно через Ctrl+C. Оба приложения используют только HTML, CSS и JavaScript, без CDN и API-ключей.

## Проверки

Из корня проекта на Node.js 22.14+ или 24 LTS:

```sh
for version in direct with-spec; do
  node --check "$version/app.mjs" || exit 1
  node --check "$version/domain.mjs" || exit 1
  node --test "$version/tests/acceptance.test.mjs" || exit 1
done
node experiment/decimal-check.mjs
node experiment/browser-check.mjs
```

Последняя команда обновляет `browser-check.html` из исходников. Для запуска проверок интерфейса откройте полученный файл в Chrome.

## Проверка спецификации в OpenSpec

Изменение build-tracker создано и строго проверено до написания кода через OpenSpec 1.15.0. Результаты есть в [логах CLI](evidence/openspec-validate.txt). Чтобы проверить спецификацию повторно, из корня проекта выполните:

```sh
cd with-spec
openspec --version
openspec validate build-tracker --strict --no-interactive
```

Если CLI ещё не установлен, пособие предлагает npm-пакет `@fission-ai/openspec@1.14.1`. В этом прогоне использовался официальный standalone-релиз 1.15.0 для Apple Silicon.

## История работы

В истории Git сохранены общий бриф и тесты, первая реализация, проверенная спецификация и реализация по ней. Ссылки на этапы приведены в [отчёте](report.md).
