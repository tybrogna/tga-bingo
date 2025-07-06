// I also got this from somewhere. Classic shuffle algo
export function shuffle(list, random=Math.random) {
    let shuffleList = [...list]
    let a = shuffleList.length;
    let tval, rand;

    while (a != 0) {
        rand = Math.floor(random() * a);
        a --;
        tval = shuffleList[a];
        shuffleList[a] = shuffleList[rand];
        shuffleList[rand] = tval;
    }
    return shuffleList;
}

// https://github.com/bryc/code/blob/master/jshash/PRNGs.md
// needed a random number generator that i could seed to get the same result every time
// not smart enough to make my own, used this one
function jsf32b(aIn, bIn, cIn, dIn) {
    let a = aIn, b = bIn, c = cIn, d = dIn;
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = a - (b << 23 | b >>> 9) | 0;
        a = b ^ (c << 16 | c >>> 16) | 0;
        b = c + (d << 11 | d >>> 21) | 0;
        b = c + d | 0;
        c = d + t | 0;
        d = a + t | 0;
        let ret = (d >>> 0) / 4294967296;
        return ret
    }
}

// https://gist.github.com/azat/2762138
// needed a function to turn a string into a bunch of numbers to seed a random number generator
// figured i didnt have to make my own
var crc32 = function(str) {
    for(var i=256, tbl=[], crc, j; i--; tbl[i]=crc>>>0){
        j=8;for(crc=i;j--;)crc=crc&1?crc>>>1^0xEDB88320:crc>>>1;
    }
    return function(str) {
        for(var n=0, crc=-1; n<str.length; ++n)
            crc=tbl[crc&255^str.charCodeAt(n)]^crc>>>8;
        return crc^-1;
    }
}();

// i did make my own here. seems to work fine
function salt(val) {
    let rem2 = val % 100
    let rem4 = val % 10000
    let mult = Math.abs(rem2).toString() + Math.abs(rem4).toString()
    return val * Number(mult)
}

export function getPRNG(seed) {
    // let seed = localStorage.getItem('seed')
    if (seed == null || seed == "") {
        let now = Date.now() % 1000000
        if (now < 100000) now += 100000
        let newSeed = new Array(9)
        newSeed[8] = String.fromCharCode((now[5] + now[4]) % 26 + 97)
        newSeed[7] = now[5]
        newSeed[6] = now[4]
        newSeed[5] = String.fromCharCode((now[5] + now[4] + now[3] + now[2]) % 26 + 97)
        newSeed[4] = now[3]
        newSeed[3] = now[2]
        newSeed[2] = String.fromCharCode((now[5] + now[4] + now[3] + now[2] + now[1] + now[0]) % 26 + 97)
        newSeed[1] = now[1]
        newSeed[0] = now[0]
        seed = newSeed.reduce((total, val) => total + val)
    }
    let v = crc32(seed)
    v = salt(v)
    return jsf32b(0xF1EA5EED,v,v,v)
}
