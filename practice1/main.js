//обычное решение
function parseUrl1(href) {
    let a = document.createElement('a');
    a.href = href;
    return a;
}

//в одну строку
function parseUrl(href) {
    return (el => (el.href = href) && el)(document.createElement('a'));
}

let a = parseUrl('http://tutu.ru:8080/do/any.php?a=1&b[]=a&b[]=b#foo');

console.log(a);

console.log(a.href == "http://tutu.ru:8080/do/any.php?a=1&b[]=a&b[]=b#foo");
console.log(a.hash == "#foo");
console.log(a.port == "8080");
console.log(a.host == "tutu.ru:8080");
console.log(a.protocol == "http:");
console.log(a.hostname == "tutu.ru");
console.log(a.pathname == "/do/any.php");
console.log(a.origin == "http://tutu.ru:8080");