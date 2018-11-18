function checkSyntax(str) {
    let brackets = ['()', '{}', '[]', '<>'], newstr;
    do {
        newstr = str;
    } while (newstr != (str = str.replace(new RegExp(brackets.map(el => `\\${el[0]}[` + brackets.map(el => `^\\${el[0]}^\\${el[1]}`).join() + `]*\\${el[1]}`).join('|'), 'g'))));
    return ((str.match(new RegExp('[' + brackets.map(el => `\\${el[0]}\\${el[1]}`).join() + ']{1}', 'g')) || []).length == 0) ? 0 : 1;
}

console.log(checkSyntax('---(++++)----') == 0);
console.log(checkSyntax('') == 0);
console.log(checkSyntax('before ( middle []) after ') == 0);
console.log(checkSyntax(') (') == 1);
console.log(checkSyntax('} {') == 1);
console.log(checkSyntax('<(   >)') == 1);
console.log(checkSyntax('(  [ <>  ()  ]  <>  )') == 0);
console.log(checkSyntax('   (      [)') == 1);
