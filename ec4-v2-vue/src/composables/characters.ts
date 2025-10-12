import { Subject } from 'rxjs';

export const deviceCharTable = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['▶', '◀', '⇈', '⇊', '«', '»', '↖', '↗', '↙', '↘', '▲', '▼', '⏎', '︿', '﹀', '█'], // ᨑ
  ['␣', '!', '"', '#', '⌧', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?'],
  ['¡', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ñ', 'Ü', '§'],
  ['¿', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'],
  ['p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ñ', 'ü', 'à'],
  ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '½', '¼', '±', '', '', 'μ'],
  ['♪', '♬', '⩍', '♡', '◇', '', '┍', '┙', '“', '”', '(', ')', 'α', 'ε', '', ''],
  ['@', '£', '$', '¥', 'è', 'é', 'ù', 'ì', 'ò', 'Ç', 'ᴾ', 'Ø', 'ø', 'ᴿ', 'Å', 'å'],
  ['Δ', 'φ', 'Φ', 'τ', 'λ', 'Ω', 'π', 'Ψ', 'Σ', 'Θ', 'Ξ', '●', 'Æ', 'æ', 'ẞ', 'É'],
  ['Γ', 'Λ', 'Π', 'Τ', '_', 'È', 'Ê', 'ê', 'Ç', 'ǧ', 'Ş', 'ş', 'İ', 'ı', '~', '◇'],
  ['▇', '▅', '▄', '▃', '▂', '▁', '█', '▊', '▌', '▎', '▏', '₧', '☐', '·', '↑', '→'],
  ['↓', '←', 'Á', 'í', 'ó', 'ú', 'ý', 'á', 'í', 'ó', 'ú', 'ý', 'Ô', 'ô', 'ů', 'ů'],
  ['č', 'Ě', 'Ř', 'Š', 'Ž', 'č', 'ě', 'ř', 'š', 'ž', '[', '\\', ']', '{', '¦', '}'],
];

function getRowColOfEditorChar(c: string) {
  for (let row = 0; row < deviceCharTable.length; row++) {
    for (let col = 0; col < deviceCharTable[row].length; col++) {
      const tc = deviceCharTable[row][col];
      if (c === tc) {
        return [row, col];
      }
    }
  }
  return [];
}

function editorCharToDeviceChar(c: string) {
  if (c === ' ') return ' ';
  const [row, col] = getRowColOfEditorChar(c);
  if (row == null || col == null) return String.fromCharCode(31);
  return String.fromCharCode(row * 16 + col);
}

function editorStringToDeviceString(s: string) {
  return s.split('').map(editorCharToDeviceChar).join('');
}

function deviceCharToEditorChar(c: string) {
  const charCode = c.charCodeAt(0);
  if (charCode < 16) return String.fromCharCode(charCode);
  const row = Math.floor(charCode / 16);
  const col = charCode % 16;
  return deviceCharTable[row][col];
}

function deviceStringToEditorString(s: string) {
  return s.split('').map(deviceCharToEditorChar).join('');
}

function keyboardHasSubscribers() {
  return charSubject$.observed;
}

const charSubject$ = new Subject<string>();

export function useCharacters() {
  return {
    deviceCharTable,
    editorStringToDeviceString,
    deviceStringToEditorString,
    publishChar(c: string) {
      charSubject$.next(c);
    },
    charSubject$: charSubject$.asObservable(),
    keyboardHasSubscribers,
  };
}
