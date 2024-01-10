
import { Document, NodeIO } from '@gltf-transform/core';


function createTorus(radius = 1, tube = 0.4, radialSegments = 12,tubularSegments = 48, arc = Math.PI * 2) {

    const indicesArray = [];
    const positionArray = [];
    const uvArray = [];

    const vertex = [0, 0, 0];

    // generate positions and uvs
    for (let j = 0; j <= radialSegments; j++) {
        for (let i = 0; i <= tubularSegments; i++) {
            const u = (i / tubularSegments) * arc;
            const v = (j / radialSegments) * Math.PI * 2;

            // position
            vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
            vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
            vertex[2] = tube * Math.sin(v);
            positionArray.push(vertex[0], vertex[1], vertex[2]);

            // uv
            uvArray.push(i / tubularSegments);
            uvArray.push(j / radialSegments);
        }
    }

    // generate indices
    for (let j = 1; j <= radialSegments; j++) {
        for (let i = 1; i <= tubularSegments; i++) {
            // indices

            const a = (tubularSegments + 1) * j + i - 1;
            const b = (tubularSegments + 1) * (j - 1) + i - 1;
            const c = (tubularSegments + 1) * (j - 1) + i;
            const d = (tubularSegments + 1) * j + i;

            // faces

            indicesArray.push(a, b, d);
            indicesArray.push(b, c, d);
        }
    }

    return { indicesArray, positionArray, uvArray };
}

export function createTorusGltf() {

    const document = new Document();
    const buffer = document.createBuffer();
    const { indicesArray, positionArray, uvArray } = createTorus();

    // indices and vertex attributes
    const indices = document
        .createAccessor()
        .setArray(new Uint16Array(indicesArray))
        .setType('SCALAR')
        .setBuffer(buffer);
    const position = document
        .createAccessor()
        .setArray(new Float32Array(positionArray))
        .setType('VEC3')
        .setBuffer(buffer);
    const texcoord = document
        .createAccessor()
        .setArray(new Float32Array(uvArray))
        .setType('VEC2')
        .setBuffer(buffer);

    // material
    const material = document.createMaterial()
        .setBaseColorHex(0xD96459)
        .setRoughnessFactor(1)
        .setMetallicFactor(0);

    // primitive and mesh
    const prim = document
        .createPrimitive()
        .setMaterial(material)
        .setIndices(indices)
        .setAttribute('POSITION', position)
        .setAttribute('TEXCOORD_0', texcoord)
        // .setAttribute('TEXCOORD_1', texcoord)
        // .setAttribute('TEXCOORD_2', texcoord)
        // .setAttribute('TEXCOORD_3', texcoord)
        // .setAttribute('TEXCOORD_4', texcoord)
        // .setAttribute('TEXCOORD_5', texcoord)
    const mesh = document.createMesh('torus')
        .addPrimitive(prim);

    const node = document.createNode('MyNode')
        .setMesh(mesh)
        .setTranslation([0, 0, 0]);

    const scene = document.createScene('MyScene')
        .addChild(node);

    const io = new NodeIO();
    io.write('./gltf/torus.gltf', document);
    io.write('./gltf/torus.glb', document);
}