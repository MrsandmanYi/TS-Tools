import fs from "fs";
import path from "path";
import sharp from "sharp";
import Jimp from "jimp";
import { SpineVertAnimImageJson, OutputJson, ImageOutputJson, OutputAnim } from './Interfaces';


const filePath = path.resolve(__dirname, "../json/trees_map_mainscene_1_SpineVertAnim.json");

const GAP_FRAME = 2; // 两个动画之间的空帧数
const VERTEX_PRECISION = 5.0; // 顶点精度， 顶点的值会除以这个数值，然后转换成0-255的值

try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(jsonData);

    let outputJsonData : OutputJson = new OutputJson();

    for (let i = 0; i < parsedData.animJsonArray.length; i++) {

        let imageOutputJson = new ImageOutputJson();
        outputJsonData.images.push(imageOutputJson);

        // 取得图片的宽高, 宽 ： 最大顶点数， 高： 动画帧数总和
        let width = 0;
        let height = 0;

        let vAnimJson : SpineVertAnimImageJson = parsedData.animJsonArray[i];
        const imageName = vAnimJson.imageName;
        let anims = vAnimJson.animations;
        for (let j = 0; j < anims.length; j++) {
            let anim = anims[j];
            height += anim.frames.length;
            if (j != anims.length - 1) {
                height += GAP_FRAME; // 两个空帧
            }
            width = Math.max(width, anim.frames[0].vertices.length);
        }

        console.log(`width: ${width}, height: ${height}`);
        imageOutputJson.imageName = imageName;
        imageOutputJson.width = width;
        imageOutputJson.height = height;
        imageOutputJson.animGapFrame = GAP_FRAME;
        imageOutputJson.vertexPrecision = VERTEX_PRECISION;

        // 根据长宽创建图片png格式，每个像素点存储一个顶点的位置信息 + 透明度信息
        const channels = 4;
        const buffer = Buffer.alloc(width * height * channels);

        // 将顶点信息和alpha写入到buffer
        let currentRow = 0;
        for (let j = 0; j < anims.length; j++) {
            let anim = anims[j];
            let outputAnim : OutputAnim = new OutputAnim();
            outputAnim.frames.startFrameIndex = currentRow;
            for (let k = 0; k < anim.frames.length; k++) {
                let frame = anim.frames[k];
                let vertices = frame.vertices;
                let alpha = frame.alpha;
                for (let l = 0; l < vertices.length; l++) {
                    let idx = (width * currentRow + l) * 4;
                    let vertex = vertices[l];
                    // 将顶点信息归一化到0-255
                    vertex.x = (vertex.x / VERTEX_PRECISION) + 255.0 / 2.0;
                    vertex.y = (vertex.y / VERTEX_PRECISION) + 255.0 / 2.0;
                    vertex.z = (vertex.z / VERTEX_PRECISION) + 255.0 / 2.0; 

                    buffer.writeUInt8(Math.floor(vertex.x), idx); // R
                    buffer.writeUInt8(Math.floor(vertex.y), idx + 1); // G
                    buffer.writeUInt8(Math.floor(vertex.z), idx + 2); // B
                    buffer.writeUInt8(Math.floor(alpha[l] * 255), idx + 3); // A 
                }
                currentRow++;
            }
            outputAnim.animName = anim.animName;
            outputAnim.frames.endFrameIndex = currentRow - 1;
            imageOutputJson.animations.push(outputAnim);
            currentRow += GAP_FRAME;
        }

        // 将图片写入到文件
        sharp(buffer, {
            raw: {
                width: width,
                height: height,
                channels: channels,
            }
        })
        .png({
            adaptiveFiltering: true,
            force: true,
        })
        .toFile(`./output/${imageName}.png`)
        .catch(err => console.error(err));

        // 使用 Jimp 写入buff到文件
        const image = new Jimp(width, height, (err, image) => {
            if (err) throw err;
            image.bitmap.data = buffer;
            image.write(`./output/${imageName}_jimp.png`);
        });
    }

    // 导出 outputJsonData 到json文件
    fs.writeFileSync(`./output/${parsedData.name}.json`, JSON.stringify(outputJsonData));

} catch (error) {
    console.error("ERROR:", error);
}