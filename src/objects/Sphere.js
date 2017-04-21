import {
    Object3D,
    SphereBufferGeometry,
    MeshStandardMaterial,
    Mesh,
    Vector3
} from 'three';

export default class Sphere extends Object3D {

    constructor() {
        super();

        const geometry = new SphereBufferGeometry(5, 32, 32);
        const material = new MeshStandardMaterial({
            color: 0xffff00,
            wireframe: true,
            roughness: 0.18,
            metalness: 0.5
        });
        const mesh = new Mesh(geometry, material);

        this.add(mesh);


    }

}