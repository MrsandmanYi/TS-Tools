import Jimp from 'jimp';

export async function createImage(imageName : string, arr : string[][], cellSize : number = 100, fontName :string = Jimp.FONT_SANS_32_WHITE) {

    // 创建新的图片，并设置其宽度和高度
    let image = new Jimp(arr[0].length * cellSize, arr.length * cellSize);

    // 加载字体
    let font = await Jimp.loadFont(fontName);

    // 遍历二维数组
    for (let y = 0; y < arr.length; y++) {
        for (let x = 0; x < arr[y].length; x++) {
            // 计算格子的中心坐标
            let posX = x * cellSize + cellSize * 0.5;
            let posY = y * cellSize + cellSize * 0.5;

             // 计算文本的偏移量
             let text = arr[y][x];
             let textWidth = Jimp.measureText(font, text);
             let textHeight = Jimp.measureTextHeight(font, text, cellSize);

            // 在对应的格子中写入数字
            image.print(font, posX - textWidth / 2, posY - textHeight / 2, text);
        }
    }

    // 画出每个格子的轮廓
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        if (x % cellSize === 0 || y % cellSize === 0 || x === image.bitmap.width - 1 || y === image.bitmap.height - 1) {
            image.bitmap.data[idx + 0] = 255; // R
            image.bitmap.data[idx + 1] = 255; // G
            image.bitmap.data[idx + 2] = 255; // B
            image.bitmap.data[idx + 3] = 255; // A
        }
    });

    // 保存图片
    await image.writeAsync("./output/"+imageName);
}