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

Порядок команд для среды, где доступны npm и Node.js. В текущем прогоне CLI установить не удалось. Причина и фактический вывод указаны в [отчёте](report.md).

```sh
cd with-spec
npx --yes --package=@fission-ai/openspec@1.14.1 openspec --version
npx --yes --package=@fission-ai/openspec@1.14.1 openspec validate build-tracker --strict --no-interactive
```

Чтобы воспроизвести процесс B с запуска CLI до реализации, инициализируйте пустую рабочую папку командой `openspec init --tools codex --language ru` перед запросом на спецификацию. Для OpenCode используйте `--tools opencode`, как в пособии.

## Публикация на GitHub

В ZIP рядом с папкой `agents-hw1/` лежит `agents-hw1-history.bundle` с локальной историей, включая первые реализации и исправление. Создайте пустой репозиторий `agents-hw1` на GitHub с доступом для преподавателя. Из распакованной папки выполните:

```sh
git clone -b main ./agents-hw1-history.bundle agents-hw1-github
cd agents-hw1-github
git remote set-url origin https://github.com/VerraAn/agents-hw1.git
git push -u origin main
```
