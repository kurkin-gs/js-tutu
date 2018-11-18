//вспомогательная функция для проверки
function randomString(length) {
    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//исходная функция
function func(s, a, b) {

    if (s.match(/^$/)) {
        return '-1';
    }

    let i = s.length - 1;
    let aIndex = -1;
    let bIndex = -1;

    while ((aIndex == -1) && (bIndex == -1) && (i > 0)) {


        if (s.substring(i, i + 1) == a) {
            aIndex = i;
        }
        if (s.substring(i, i + 1) == b) {

            bIndex = i;
        }
        i = i - 1;
    }


    if (aIndex != -1) {
        if (bIndex == -1) {
            return aIndex;
        } else {
            return Math.max(aIndex, bIndex);
        }
    }

    if (bIndex != -1) {
        return bIndex;
    } else {
        return -1;
    }
}

//отрефакторенная функция
function funcRef(s, a, b) {
    if (!s.length)
        return -1;
    let aIndex = a.length == 1 ? s.lastIndexOf(a) : null,
            bIndex = b.length == 1 ? s.lastIndexOf(b) : null;
    return aIndex && aIndex >= bIndex ? aIndex : bIndex || -1;
}

//проверка
let errors = 0;
for (let i = 1; i < 1000; i++) {
    let s = randomString(Math.ceil(Math.random() * 30));
    let a = randomString(1);
    let b = randomString(1);

    if (func(s, a, b) != funcRef(s, a, b)) {
        errors++
        console.log("Неверный результат для параметров: ", s, a, b);
    }
}

console.log("Проверка завершена");
console.log(errors == 0 ? "Ошибок не найдено" : "Количество ошибок: " + errors);