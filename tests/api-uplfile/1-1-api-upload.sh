#!/bin/bash

export XURL="http://localhost:8082/api/uplfile"


# Задайте бажаний інтервал у секундах
INTERVAL=5 # Наприклад, 5 секунд

XCURL_CMD="curl -k --verbose -X POST \"$XURL\" \
-F \"formfield1=myvalue1\" \
-F \"formfield2=myvalue2\" \
-F \"file=@krisa1.jpg\""


echo "Натисніть Ctrl+C, щоб зупинити."

while true
do
  echo "Виконується запит: $(date)"
  eval $XCURL_CMD
  # Якщо ви хочете бачити результат запиту (якщо curl виводить його в stdout або файл),
  # додайте відповідну команду тут.
  # Наприклад, якщо curl зберігає результат у файл XRES:
  # XRES_FILE="response_$(date +%s).json" # Створювати унікальне ім'я файлу
  # eval "$XCURL_CMD -o $XRES_FILE"
  # echo "Відповідь збережено у $XRES_FILE"
  # cat "$XRES_FILE"
  echo "" # Додає порожній рядок для кращої читабельності між запитами
  sleep $INTERVAL
done