import Jimp from 'jimp';
import { createImage } from './functions';


let arr: string[][] = [];

for (let y = 29; y >= 0; y--) {
    arr[y] = [];
    for (let x = 0; x < 30; x++) {
        arr[y][x] = `(${x},${29-y})`;
    }
}

createImage("grid.png", arr, 60, Jimp.FONT_SANS_16_WHITE);