import { stripPunctuation } from '../lib/hymn-processor/parser';

const testText = "Abide, O dearest Jesus, don't leave us here alone.";
console.log('Original:', testText);
console.log('Stripped:', stripPunctuation(testText));
console.log('');

const testText2 = "O come, all ye faith-ful, joyful and triumphant.";
console.log('Original:', testText2);
console.log('Stripped:', stripPunctuation(testText2));
console.log('');

console.log('Apostrophes preserved?', stripPunctuation(testText).includes("'"));
console.log('Hyphens preserved?', stripPunctuation(testText2).includes('-'));
