import { Document, NodeIO } from '@gltf-transform/core';

export interface MeshData {
    name: string;
    position: number[];
    indices: number[];
    normal: number[]|undefined;
    vertexColor: number[]|undefined;
    uv0: number[];
    uv1: number[]|undefined;
    uv2: number[]|undefined;
    uv3: number[]|undefined;
    uv4: number[]|undefined;
    uv5: number[]|undefined;
    uv6: number[]|undefined;
    uv7: number[]|undefined;
}

export interface Vector3{
    x: number;
    y: number;
    z: number;
}

export interface Vector2{
    x: number;
    y: number;
}

export interface Color{
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface JsonData {
    name: string;
    meshData : {
        vertices: Vector3[];
        indices: number[];
        normal: Vector3[];
        vertexColor: Color[];
        uv0: Vector2[];
        uv1: Vector2[];
        uv2: Vector2[];
        uv3: Vector2[];
        uv4: Vector2[];
        uv5: Vector2[];
        uv6: Vector2[];
        uv7: Vector2[];
    }
}


export function ExtractMeshDataFromJson(json: JsonData): MeshData {
    
    let position: number[] = [];
    let indices: number[] = [];
    let normal: number[] = [];
    let vertexColor: number[] = [];
    let uv0: number[] = [];
    let uv1: number[] = [];
    let uv2: number[] = [];
    let uv3: number[] = [];
    let uv4: number[] = [];
    let uv5: number[] = [];
    let uv6: number[] = [];
    let uv7: number[] = [];

    json.meshData.vertices.forEach(v => {
        position.push(v.x);
        position.push(v.y);
        position.push(v.z);
    });

    json.meshData.indices.forEach(i => {
        indices.push(i);
    });

    if (json.meshData.normal) {
        json.meshData.normal.forEach(n => {
            normal.push(n.x);
            normal.push(n.y);
            normal.push(n.z);
        });
    }

    if (json.meshData.vertexColor) {
        json.meshData.vertexColor.forEach(c => {
            vertexColor.push(c.r);
            vertexColor.push(c.g);
            vertexColor.push(c.b);
            vertexColor.push(c.a);
        });
    }

    if (json.meshData.uv0) {
        json.meshData.uv0.forEach(u => {
            uv0.push(u.x);
            uv0.push(u.y);
        });
    }

    if (json.meshData.uv1) {
        json.meshData.uv1.forEach(u => {
            uv1.push(u.x);
            uv1.push(u.y);
        });
    }

    if (json.meshData.uv2) {
        json.meshData.uv2.forEach(u => {
            uv2.push(u.x);
            uv2.push(u.y);
        });
    }

    if (json.meshData.uv3) {
        json.meshData.uv3.forEach(u => {
            uv3.push(u.x);
            uv3.push(u.y);
        });
    }

    if (json.meshData.uv4) {
        json.meshData.uv4.forEach(u => {
            uv4.push(u.x);
            uv4.push(u.y);
        });
    }

    if (json.meshData.uv5) {
        json.meshData.uv5.forEach(u => {
            uv5.push(u.x);
            uv5.push(u.y);
        });
    }

    if (json.meshData.uv6) {
        json.meshData.uv6.forEach(u => {
            uv6.push(u.x);
            uv6.push(u.y);
        });
    }

    if (json.meshData.uv7) {
        json.meshData.uv7.forEach(u => {
            uv7.push(u.x);
            uv7.push(u.y);
        });
    }


    return {
        name: json.name,
        position: position,
        indices: indices,
        normal: normal.length > 0 ? normal : undefined,
        vertexColor: vertexColor.length > 0 ? vertexColor : undefined,
        uv0: uv0,
        uv1: uv1.length > 0 ? uv1 : undefined,
        uv2: uv2.length > 0 ? uv2 : undefined,
        uv3: uv3.length > 0 ? uv3 : undefined,
        uv4: uv4.length > 0 ? uv4 : undefined,
        uv5: uv5.length > 0 ? uv5 : undefined,
        uv6: uv6.length > 0 ? uv6 : undefined,
        uv7: uv7.length > 0 ? uv7 : undefined,
    }
}


export function CreateGltfDocumentFromMeshData(meshData : MeshData){

    const document = new Document();
    const buffer = document.createBuffer();

    const indices = document
        .createAccessor()
        .setArray(new Uint16Array(meshData.indices))
        .setType('SCALAR')
        .setBuffer(buffer);

    const position = document
    .createAccessor()
    .setArray(new Float32Array(meshData.position))
    .setType('VEC3')
    .setBuffer(buffer);

    let normal;
    if (meshData.normal) {
        normal = document
        .createAccessor()
        .setArray(new Float32Array(meshData.normal))
        .setType('VEC3')
        .setBuffer(buffer);
    }

    let vertexColor;
    if (meshData.vertexColor) {
        vertexColor = document
        .createAccessor()
        .setArray(new Float32Array(meshData.vertexColor))
        .setType('VEC4')
        .setBuffer(buffer);
    }

    const texcoord = document
    .createAccessor()
    .setArray(new Float32Array(meshData.uv0))
    .setType('VEC2')
    .setBuffer(buffer);

    let texcoord1;
    if (meshData.uv1) {
        texcoord1 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv1))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord2;
    if (meshData.uv2) {
        texcoord2 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv2))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord3;
    if (meshData.uv3) {
        texcoord3 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv3))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord4;
    if (meshData.uv4) {
        texcoord4 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv4))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord5;
    if (meshData.uv5) {
        texcoord5 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv5))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord6;
    if (meshData.uv6) {
        texcoord6 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv6))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    let texcoord7;
    if (meshData.uv7) {
        texcoord7 = document
        .createAccessor()
        .setArray(new Float32Array(meshData.uv7))
        .setType('VEC2')
        .setBuffer(buffer);
    }

    const material = document.createMaterial()
    .setBaseColorHex(0xFFFFFF)
    .setRoughnessFactor(1)
    .setMetallicFactor(0);

    const prim = document
    .createPrimitive()
    .setMaterial(material)
    .setIndices(indices)
    .setAttribute('POSITION', position)
    .setAttribute('TEXCOORD_0', texcoord)

    if (normal) prim.setAttribute('NORMAL', normal);
    if (vertexColor) prim.setAttribute('COLOR_0', vertexColor);

    if (texcoord1) prim.setAttribute('TEXCOORD_1', texcoord1);
    if (texcoord2) prim.setAttribute('TEXCOORD_2', texcoord2);
    if (texcoord3) prim.setAttribute('TEXCOORD_3', texcoord3);
    if (texcoord4) prim.setAttribute('TEXCOORD_4', texcoord4);
    if (texcoord5) prim.setAttribute('TEXCOORD_5', texcoord5);
    if (texcoord6) prim.setAttribute('TEXCOORD_6', texcoord6);
    if (texcoord7) prim.setAttribute('TEXCOORD_7', texcoord7);

    const mesh = document.createMesh(meshData.name)
    .addPrimitive(prim);

    const node = document.createNode('MyNode')
        .setMesh(mesh)
        .setTranslation([0, 0, 0]);

    const scene = document.createScene('MyScene')
        .addChild(node);
    
    return document;
}