
import fs from "fs";
import path from "path";
const PNG = require('pngjs').PNG

type Vec4 = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Sprite = {
    name: string;
    bounds: Vec4;
    rotate: number;
};

type AtlasObject = {
    imageName: string;
    imageSize: number[];
    sprites: Sprite[];
};

function parseAtlasFile(content: string): AtlasObject {
    const lines = content.split('\n');
    const atlasObject: AtlasObject = { imageName: '', imageSize: [], sprites: [] };
    let currentSprite: Sprite | null = null;

    for (const line of lines) {
        if (line.endsWith('.png')) {
            atlasObject.imageName = line;
            continue;
        }

        if (line.startsWith('size:')) {
            atlasObject.imageSize = line.slice(5).split(',').map(Number);
            continue;
        }

        if (!line.startsWith('  ') && 
        !line.startsWith('size:') && 
        !line.startsWith('format:') &&
         !line.startsWith('filter:') &&
          !line.startsWith('repeat:') && 
          !line.startsWith('rotate:') &&
          !line.startsWith('pma:') &&
          !line.startsWith('bounds:') &&
          !line.startsWith('offsets:') &&
          !line.endsWith('.png') && !line.endsWith(".jpg") && line!==''
          ){
            currentSprite = { name: line, bounds: {
                x: 0, y: 0, width: atlasObject.imageSize[0], height: atlasObject.imageSize[1]
            }, rotate: 0 };
            atlasObject.sprites.push(currentSprite);
            continue;
        }

        if (currentSprite) {
            if (line.startsWith('bounds:')) {
                const bs = line.slice(7).split(',').map(Number);
                currentSprite.bounds = { x: bs[0], y: bs[1], width: bs[2], height: bs[3] };
            } else if (line.startsWith('rotate:')) {
                currentSprite.rotate = Number(line.slice(7));
            }
        }
    }

    return atlasObject;
}

function getImageTypeCount(dirPath : string) : {
    num : number;
    dirs : Array<string>;
}{
    let result = {
        num : 0,
        dirs : new Array<string>()
    }

    dirPath = dirPath + "/" + "textures";
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        // 如果是文件夹
        let filePath : string  = path.resolve(dirPath, file);
        if (fs.statSync(path.resolve(dirPath, file)).isDirectory()) {
            result.num++;
            result.dirs.push(filePath);
        }
    });

    result.num = result.num == 0 ? 1 : result.num;
    return result;
}

const filePath = path.resolve(__dirname, "../tex");

// 拿到子文件夹
const directories = fs.readdirSync(filePath);

// 遍历子文件夹
directories.forEach((dir) => {
  const dirPath = path.resolve(filePath, dir);
  const files = fs.readdirSync(dirPath);
  const imageType = getImageTypeCount(dirPath);
    
  // 遍历文件
  files.forEach((file) => {
    const filePath = path.resolve(dirPath, file);
    let atlasObject = null;
    if (filePath.endsWith(".atlas")) {

        const atlasContent = fs.readFileSync(filePath, "utf-8");
        
        atlasObject = parseAtlasFile(atlasContent);

        // 根据atlasObject创建png图片
        const png = new PNG({ 
            width: atlasObject.imageSize[0],
            height: atlasObject.imageSize[1] * imageType.num,
            colorType: 6,
            inputColorType: 6,
            inputHasAlpha: true
         });
         

        // 根据命名规范开始合并图片
        for(let i = 0; i < imageType.num; i++){

            for(let j = 0; j < atlasObject.sprites.length; j++){
                const sprite = atlasObject.sprites[j];
                let spriteImage;
                if (/_\d{1,2}$/.test(sprite.name)) {
                    const dPath = imageType.dirs[i];
                    const postfix = sprite.name.match(/_\d{1,2}$/)![0];
                    // 读取 dPath 下带有 postfix 的图片
                    const imageFiles = fs.readdirSync(dPath);
                    const imageFile = imageFiles.find((file) => file.endsWith(postfix + ".png"));
                    spriteImage = PNG.sync.read(fs.readFileSync(path.resolve(dPath, imageFile!)));
                }
                else
                {
                    spriteImage = PNG.sync.read(fs.readFileSync(path.resolve(dirPath + "/" + "textures", sprite.name + ".png")));
                }
                
                // 考虑rotate旋转参数，将spriteImage的像素点写入到png中
                // 当前图集索引，从上到下
                const atlasIndex = i;

                if (sprite.rotate === 90) {
                    // 创建一张新的图片，将spriteImage旋转90度
                    const newImage = new PNG({
                        width: spriteImage.height,
                        height: spriteImage.width,
                        colorType: 6,
                        inputColorType: 6,
                        inputHasAlpha: true
                    });

                    for (let x = 0; x < spriteImage.width; x++) {
                        for (let y = 0; y < spriteImage.height; y++) {
                            const i = (spriteImage.width * y + x) * 4;
                            const j = (spriteImage.height * 4 * (spriteImage.width - x - 1) + y * 4);
                            newImage.data[j] = spriteImage.data[i];
                            newImage.data[j + 1] = spriteImage.data[i + 1];
                            newImage.data[j + 2] = spriteImage.data[i + 2];
                            newImage.data[j + 3] = spriteImage.data[i + 3];
                        }
                    }
                    spriteImage = newImage;
                }
                else if (sprite.rotate === 180) {
                    // 创建一张新的图片，将spriteImage旋转180度
                    const newImage = new PNG({
                        width: spriteImage.width,
                        height: spriteImage.height,
                        colorType: 6,
                        inputColorType: 6,
                        inputHasAlpha: true
                    });

                    for (let x = 0; x < spriteImage.width; x++) {
                        for (let y = 0; y < spriteImage.height; y++) {
                            const i = (spriteImage.width * y + x) * 4;
                            const j = (spriteImage.width * 4 * (spriteImage.height - y - 1) + (spriteImage.width - x - 1) * 4);
                            newImage.data[j] = spriteImage.data[i];
                            newImage.data[j + 1] = spriteImage.data[i + 1];
                            newImage.data[j + 2] = spriteImage.data[i + 2];
                            newImage.data[j + 3] = spriteImage.data[i + 3];
                        }
                    }
                    spriteImage = newImage;
                }
                else if (sprite.rotate === 270) {
                    // 创建一张新的图片，将spriteImage旋转270度
                    const newImage = new PNG({
                        width: spriteImage.height,
                        height: spriteImage.width,
                        colorType: 6,
                        inputColorType: 6,
                        inputHasAlpha: true
                    });

                    for (let x = 0; x < spriteImage.width; x++) {
                        for (let y = 0; y < spriteImage.height; y++) {
                            const i = (spriteImage.width * y + x) * 4;
                            const j = (spriteImage.height * 4 * x + (spriteImage.height - y - 1) * 4);
                            newImage.data[j] = spriteImage.data[i];
                            newImage.data[j + 1] = spriteImage.data[i + 1];
                            newImage.data[j + 2] = spriteImage.data[i + 2];
                            newImage.data[j + 3] = spriteImage.data[i + 3];
                        }
                    }
                    spriteImage = newImage;
                }

                for (let x = 0; x < spriteImage.width; x++) {
                    for (let y = 0; y < spriteImage.height; y++) {
                        const i = (spriteImage.width * y + x) * 4;
                        const j = (atlasObject.imageSize[0] * 4 * (atlasIndex * atlasObject.imageSize[1] + sprite.bounds.y + y) + (sprite.bounds.x + x) * 4);
                        png.data[j] = spriteImage.data[i];
                        png.data[j + 1] = spriteImage.data[i + 1];
                        png.data[j + 2] = spriteImage.data[i + 2];
                        png.data[j + 3] = spriteImage.data[i + 3];
                    }
                }
            

            }
        }

        let imagePath = `./output/tex_skins_${atlasObject.imageName}`;
        png.pack().pipe(fs.createWriteStream(imagePath));

        // // 读取并缩小图片大小
        // const image = PNG.sync.read(fs.readFileSync(imagePath));
        // const newImage = new PNG({
        //     width: image.width / 2,
        //     height: image.height / 2,
        //     colorType: 6,
        //     inputColorType: 6,
        //     inputHasAlpha: true
        // });

        // newImage.data = new Uint8Array(newImage.width * newImage.height * 4);

        // for (let x = 0; x < newImage.width; x++) {
        //     for (let y = 0; y < newImage.height; y++) {
        //         const i = (newImage.width * y + x) * 4;
        //         const j = (image.width * 4 * (y * 2) + x * 2) * 4;
        //         newImage.data[i] = image.data[j];
        //         newImage.data[i + 1] = image.data[j + 1];
        //         newImage.data[i + 2] = image.data[j + 2];
        //         newImage.data[i + 3] = image.data[j + 3];
        //     }
        // }

        // newImage.pack().pipe(fs.createWriteStream(imagePath));

        


    }
  });
});

