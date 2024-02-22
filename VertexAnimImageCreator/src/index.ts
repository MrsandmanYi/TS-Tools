import fs from "fs";
import path from "path";
import sharp from "sharp";
import Jimp from "jimp";
const PNG = require('pngjs').PNG
import { SpineVertAnimImageJson, OutputJson, ImageOutputJson, OutputAnim } from './Interfaces';


const filePath = path.resolve(__dirname, "../json/trees_map_mainscene_1_SpineVertAnim.json");

const GAP_FRAME = 2; // 两个动画之间的空帧数
const VERTEX_PRECISION = 80.0; // 顶点精度

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
        const buffer = new Uint16Array(width * height * 4);

        const floatBuffer = new Float32Array(width * height * 4);

        const floatIndexArray : number[] = []
        const floatIndexMap : Map<number, number> = new Map();
        const indexArray = new Uint16Array(width * height * 4);

        const uint16Buffer = new Uint16Array(width * height * 4);

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

                    floatBuffer[idx] = vertex.x;
                    floatBuffer[idx + 1] = vertex.y;
                    floatBuffer[idx + 2] = vertex.z;
                    floatBuffer[idx + 3] = alpha[l];

                    let xp = Number(vertex.x.toFixed(2));
                    let yp = Number(vertex.y.toFixed(2));
                    let zp = Number(vertex.z.toFixed(2));
                    let ap = Number(alpha[l].toFixed(2));
                    if (!floatIndexMap.has(xp)) {
                        floatIndexMap.set(xp, floatIndexArray.length);
                        floatIndexArray.push(xp);
                        indexArray[idx] = floatIndexArray.length - 1;
                    }
                    else {
                        let ii = floatIndexMap.get(xp);
                        if (ii) {
                            indexArray[idx] = ii;                            
                        }
                    }

                    if (!floatIndexMap.has(yp)) {
                        floatIndexMap.set(yp, floatIndexArray.length);
                        floatIndexArray.push(yp);
                        indexArray[idx + 1] = floatIndexArray.length - 1;
                    }
                    else {
                        let ii = floatIndexMap.get(yp);
                        if (ii) {
                            indexArray[idx + 1] = ii;                            
                        }
                    }

                    if (!floatIndexMap.has(zp)) {
                        floatIndexMap.set(zp, floatIndexArray.length);
                        floatIndexArray.push(zp);
                        indexArray[idx + 2] = floatIndexArray.length - 1;
                    }
                    else {
                        let ii = floatIndexMap.get(zp);
                        if (ii) {
                            indexArray[idx + 2] = ii;                            
                        }
                    }

                    if (!floatIndexMap.has(ap)) {
                        floatIndexMap.set(ap, floatIndexArray.length);
                        floatIndexArray.push(ap);
                        indexArray[idx + 3] = floatIndexArray.length - 1;
                    }
                    else {
                        let ii = floatIndexMap.get(ap);
                        if (ii) {
                            indexArray[idx + 3] = ii;                            
                        }
                    }


                    let v  = {x: vertex.x, y: vertex.y, z: vertex.z,a : alpha[l]};
                    // 将顶点信息归一化到0-65535
                    v.x = (vertex.x + 400.0) * VERTEX_PRECISION;
                    v.y = (vertex.y + 400.0) * VERTEX_PRECISION;
                    v.z = (vertex.z + 400.0) * VERTEX_PRECISION;
                    v.a = alpha[l] * 65535;

                    buffer[idx] = v.x;
                    buffer[idx + 1] = v.y;
                    buffer[idx + 2] = v.z;
                    buffer[idx + 3] = v.a;
                    
                    uint16Buffer[idx] = (v.x + 300) * 100;
                    uint16Buffer[idx + 1] = (v.y + 100) * 100;
                    uint16Buffer[idx + 2] = v.z * 2000;
                    uint16Buffer[idx + 3] = v.a * 2000;

                }
                currentRow++;
            }
            outputAnim.animName = anim.animName;
            outputAnim.frames.endFrameIndex = currentRow - 1;
            imageOutputJson.animations.push(outputAnim);
            currentRow += GAP_FRAME;
        }

        // 创建一个 PNG 图像
        const png = new PNG({
            width: width,
            height: height,
            filterType: -1,
            colorType: 6,
            inputHasAlpha: true,
            bitDepth: 16,
        });
        png.data = Buffer.from(buffer.buffer);
        // 将 PNG 图像保存到文件
        png.pack().pipe(fs.createWriteStream(`./output/${imageName}.png`));

        // 将 buffer 保存到二进制文件保存到本地
        const bufferFilePath = `./output/${imageName}.bin`;
        fs.writeFileSync(bufferFilePath, Buffer.from(buffer.buffer));
        
        const floatBufferFilePath = `./output/${imageName}_float.bin`;
        fs.writeFileSync(floatBufferFilePath, Buffer.from(floatBuffer.buffer));

        // const uint16BufferFilePath = `./output/${imageName}_uint16.bin`;
        // fs.writeFileSync(uint16BufferFilePath, Buffer.from(uint16Buffer.buffer));

        const indexArrayFilePath = `./output/${imageName}_index.bin`;
        fs.writeFileSync(indexArrayFilePath, Buffer.from(indexArray.buffer));

        const floatIndexArrayFilePath = `./output/${imageName}_float_Index.bin`;
        const floatIndexArrayBuffer = new Float32Array(floatIndexArray);
        fs.writeFileSync(floatIndexArrayFilePath, Buffer.from(floatIndexArrayBuffer.buffer));

        console.log(floatIndexArrayBuffer);
    }

    // 导出 outputJsonData 到json文件
    fs.writeFileSync(`./output/${parsedData.name}.json`, JSON.stringify(outputJsonData));

} catch (error) {
    console.error("ERROR:", error);
}