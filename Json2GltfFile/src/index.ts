import fs from "fs";
import path from "path";
import { CreateGltfDocumentFromMeshData, ExtractMeshDataFromJson, MeshData } from './Functions';
import { NodeIO } from "@gltf-transform/core";

//import { createTorusGltf } from "./TorusTest";
//createTorusGltf();

const dirPath = path.resolve(__dirname, "../json/");
const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        let filePath : string  = path.resolve(dirPath, file);
        if (filePath.endsWith(".json")) {
            try {
                const jsonData = fs.readFileSync(filePath, "utf-8");
                const parsedData = JSON.parse(jsonData);
                //console.log(jsonData);
            
                const meshData = ExtractMeshDataFromJson(parsedData[0]);
                const document = CreateGltfDocumentFromMeshData(meshData);
            
                const io = new NodeIO();
                io.write('./gltf/' + meshData.name + '.gltf', document);
                io.write('./gltf/' + meshData.name + '.glb', document);
            
            } catch (error) {
                console.error("Error reading or parsing JSON file:", error);
            }
        }
    });



