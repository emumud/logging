const util = require('util');

/* eslint-disable no-useless-escape */

const colorMapRegex = /`(?:([0-9a-zA-Z]))([^:`\n]{1,2}|[^`\n]{3,}?)`/g;
const gcRegex = /([-])?(?:([\d]{1,5})Q)?(?:([\d]{1,3})T)?(?:([\d]{1,3})B)?(?:([\d]{1,3})M)?(?:([\d]{1,3})K)?(?:([\d]{1,3}))?GC/g;
const dateRegex = /(\d{1,4})AD D(\d{1,3})/g;
const trustScriptRegex = /(#s.|[^#\.a-z0-9_]|^)(trust|accts|autos|scripts|users|sys|corps|chats|gui|escrow|market|kernel)\.([a-z_][a-z0-9_]*)/g;
const scriptRegex = /(#s.|\b|^)([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)/g;
const keyValueRegex = /((?:(?:"(?:[^"\\\n]|\\.)+")|(?:[a-zA-z_][\w]*))[\t ]{0,2}):([\t ]{0,2}(?:(?:true)|(?:false)|(?:null)|(?:[0-9]*)(?:"(?:[^"\\\n]|\\.)*")|(?:\-?\d+\.?\d*)|\{|\[|#s.[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*))/g;

const escapeRegex = /\\u([\d\w]{4})/gi;

/* eslint-enable no-useless-escape */

const colorLookup = {
  normal: {
    0: '#9B9B9B',
    1: '#FFFFFF',
    2: '#1EFF00',
    3: '#0070DD',
    4: '#B035EE',
    5: '#FF8000',
    6: '#FF8000',
    7: '#FF8000',
    8: '#FF8000',
    9: '#FF8000',
    a: '#000000',
    b: '#3F3F3F',
    c: '#676767',
    d: '#7D0000',
    e: '#8E3434',
    f: '#A34F00',
    g: '#725437',
    h: '#A88600',
    i: '#B2934A',
    j: '#939500',
    k: '#495225',
    l: '#299400',
    m: '#23381B',
    n: '#00535B',
    o: '#324A4C',
    p: '#0073A6',
    q: '#385A6C',
    r: '#010067',
    s: '#507AA1',
    t: '#601C81',
    u: '#43314C',
    v: '#8C0069',
    w: '#973984',
    x: '#880024',
    y: '#762E4A',
    z: '#101215',
    A: '#FFFFFF',
    B: '#CACACA',
    C: '#9B9B9B',
    D: '#FF0000',
    E: '#FF8383',
    F: '#FF8000',
    G: '#F3AA6F',
    H: '#FBC803',
    I: '#FFD863',
    J: '#FFF404',
    K: '#F3F998',
    L: '#1EFF00',
    M: '#B3FF9B',
    N: '#00FFFF',
    O: '#8FE6FF',
    P: '#0070DD',
    Q: '#A4E3FF',
    R: '#0000FF',
    S: '#7AB2F4',
    T: '#B035EE',
    U: '#E6C4FF',
    V: '#FF00EC',
    W: '#FF96E0',
    X: '#FF0070',
    Y: '#FF6A98',
    Z: '#0C112B',
  },

  hardline: {
    0: '#E3F594',
    1: '#FDFDFD',
    2: '#A923FB',
    3: '#FD1600',
    4: '#FCFC14',
    5: '#1DFDFD',
    6: '#1DFDFD',
    7: '#1DFDFD',
    8: '#1DFDFD',
    9: '#1DFDFD',
    A: '#FDFDFD',
    a: '#1F0101',
    B: '#FCFCC4',
    b: '#6D5130',
    C: '#E3F594',
    c: '#A19C5C',
    D: '#1FFD82',
    d: '#00EF3A',
    E: '#BFFCC0',
    e: '#38FD5A',
    F: '#1DFDFD',
    f: '#00FDB3',
    G: '#9BFDF8',
    g: '#4CC076',
    H: '#1DFAFD',
    h: '#00B3BB',
    I: '#9CFDFD',
    i: '#52F4CF',
    J: '#24C9FC',
    j: '#0053AA',
    K: '#DAFEFE',
    k: '#3C2D57',
    L: '#A923FB',
    l: '#4311A6',
    M: '#FCF7FD',
    m: '#470B33',
    N: '#FE1A6A',
    n: '#B10C0C',
    O: '#FDE4A2',
    o: '#8E2D2E',
    P: '#FD1600',
    p: '#FD1601',
    Q: '#FDFCAB',
    q: '#BC2E24',
    R: '#FDDD03',
    r: '#C04F01',
    S: '#FDC165',
    s: '#FD532B',
    T: '#FCFC14',
    t: '#BAF700',
    U: '#FDFDBF',
    u: '#7D781A',
    V: '#96FD02',
    v: '#2FFD01',
    W: '#F1FD90',
    w: '#71FD0C',
    X: '#1EFD0C',
    x: '#00FA0B',
    Y: '#A5FD87',
    y: '#3DDE1C',
    Z: '#611300',
    z: '#3C0401',
  },
};

const userColors = [
  'J',
  'W',
  '2',
  '0',
  'K',
  'M',
];

function hexToRGB(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function rgb(r, g, b, text) {
  r = r < 0 ? 0 : Math.round(r);
  r = r > 255 ? 255 : Math.round(r);

  g = g < 0 ? 0 : Math.round(g);
  g = g > 255 ? 255 : Math.round(g);

  b = b < 0 ? 0 : Math.round(b);
  b = b > 255 ? 255 : Math.round(b);

  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

function rgbNoEnd(r, g, b, text) {
  r = r < 0 ? 0 : Math.round(r);
  r = r > 255 ? 255 : Math.round(r);

  g = g < 0 ? 0 : Math.round(g);
  g = g > 255 ? 255 : Math.round(g);

  b = b < 0 ? 0 : Math.round(b);
  b = b > 255 ? 255 : Math.round(b);

  return `\x1b[38;2;${r};${g};${b}m${text}`;
}

function rgbNoText(r, g, b) {
  r = r < 0 ? 0 : Math.round(r);
  r = r > 255 ? 255 : Math.round(r);

  g = g < 0 ? 0 : Math.round(g);
  g = g > 255 ? 255 : Math.round(g);

  b = b < 0 ? 0 : Math.round(b);
  b = b > 255 ? 255 : Math.round(b);

  return `\x1b[38;2;${r};${g};${b}m`;
}

function backRgb(r, g, b, text) {
  return `\x1b[48;2;${r};${g};${b}m${text}\x1b[0m`;
}

function underline(text) {
  return `\x1b[4m${text}\x1b[0m`;
}

function bold(text) {
  return `\x1b[1m${text}\x1b[0m`;
}

function italic(text) {
  return `\x1b[3m${text}\x1b[0m`;
}

function strikethrough(text) {
  return `\x1b[9m${text}\x1b[0m`;
}

function recurse_pretty(a, input) {
  if (!a) return a;

  if (Array.isArray(a)) {
    a.forEach((el, i) => a[i] = recurse_pretty(el));
  } else if (typeof a === 'object') {
    for (const i in a) {
      a[i] = recurse_pretty(a[i]);
    }
  } else if (typeof a === 'string') {
    return parse(a, input);
  }

  return a;
}

function print(a) {
  const format = util.formatWithOptions({ colors: true }, a);
  return format.replace(escapeRegex, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
}

function logNoNL(args = '') {
  const pretty = recurse_pretty(args);

  process.stdout.write(print(pretty));
}

function log(args = '') {
  const pretty = recurse_pretty(args);

  console.log(print(pretty));
}

function logInput(args = '') {
  const pretty = recurse_pretty(args, true);

  console.log(print(pretty));
}

function getMainColor() {
  if (global.hardline !== undefined && global.hardline.status() === true) {
    return [255, 255, 255];
  }

  return [131, 188, 242];
}

function getColorCodeHex(colorCode) {
  return global.hardline !== undefined && global.hardline.status() === true ? colorLookup.hardline[colorCode] : colorLookup.normal[colorCode];
}

function hackmudColor(colorCode, text, input) {
  const color = hexToRGB(getColorCodeHex(colorCode));
  const mainColor = getMainColor();

  return input ? rgb(color.r, color.g, color.b, text) : `\x1b[0m${rgb(color.r, color.g, color.b, text)}${rgbNoText(mainColor[0], mainColor[1], mainColor[2])}`;
}

/*function hackmudColorNoEnd(colorCode) {
  const color = hexToRGB(getColorCodeHex(colorCode));

  return rgbNoEnd(color.r, color.g, color.b);
}*/

function scriptColor(scriptor, user, script, text) {
  const _scriptor = `\`A${scriptor}\``;
  const _user = `\`0${user}\``;
  const _divider = '`A.`';
  const _script = `\`2${script}\``;

  const inQuote = (text.match(/".+?"/g) || []).some((i) => i.includes(`${scriptor}${user}.${script}`));

  if (inQuote) {
    return scriptor === '' ? `\`${_user}${_divider}${_script}\`V` : `${_scriptor}${_user}${_divider}${_script}\`V`;
  }

  return scriptor === '' ? `${_user}${_divider}${_script}` : `${_scriptor}${_user}${_divider}${_script}`;
}

let users = [];

function getUserColor(user) {
  if (users.includes(user)) {
    users.push(user);
  }

  return userColors[users.indexOf(user) % userColors.length];
}

function parse(str, input) {
  if (!input || global.mode === 'hackmud+') {
    str = str.replace(gcRegex, (match, neg, q, t, b, m, k, n) => `\`B${
      neg || ''
    }${q ? `${q}\`DQ\`` : ''
    }${t ? `${t}\`VT\`` : ''
    }${b ? `${b}\`JB\`` : ''
    }${m ? `${m}\`LM\`` : ''
    }${k ? `${k}\`NK\`` : ''
    }${n || ''
    }\`CGC\``);

    str = str.replace(dateRegex,
      '`A$1`'
                      + '`BAD` '
                      + '`CD`'
                      + '`L$2`');

    str = str.replace(':::TRUST COMMUNICATION:::', '`D$&`');

    for (let i = 0; i < users.length; i++) {
      str = str.replace(new RegExp(`\\B@${users[i]}\\b`, 'g'), `\`0@\`\`${userColors[i % userColors.length]}${users[i]}\``);
    }
  }

  str = str.replace(trustScriptRegex,
    '$1'
                    + '`F$2`.'
                    + '`L$3`');

  str = str.replace(scriptRegex, (_, a, b, c) => scriptColor(a, b, c, str));

  str = str.replace(keyValueRegex,
    '`N$1`:'
                    + '`V$2`');
  if (!input) {
    const mainColor = getMainColor();

    str = rgb(mainColor[0], mainColor[1], mainColor[2], str);
  }

  if (input && global.internalScripts !== undefined) {
    for (let i = 0; i < global.internalScripts.length; i++) {
      // let toCheck = input === 'after' ? str.slice(2) : str;

      if (str.startsWith(global.internalScripts[i])) {
        str = str.replace(global.internalScripts[i], `\`0${global.internalScripts[i]}\``);
      }
    }
  }

  str = str.replace(colorMapRegex, (_, a, b) => hackmudColor(a, b, input));

  return str;
}

module.exports = {
  log,
  logNoNL,
  logInput,
  parse,
  rgb,
  backRgb,
  rgbNoEnd,
  hackmudColor,
  getUserColor,
  scriptColor,
  keyValueRegex,
  trustScriptRegex,
  scriptRegex,
  underline,
  italic,
  bold,
  strikethrough
};
