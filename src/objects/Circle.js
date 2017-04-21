import {
    Object3D,
    CircleBufferGeometry,
    LineBasicMaterial,
    Geometry,
    Line,
    Vector3,
    Mesh
} from 'three';

export default class Circle extends Object3D {
    constructor() {
        super();
        this.origVert = [];
        var segmentCount = 100,
            radius = 0.5,
            geometry = new Geometry(),
            material = new LineBasicMaterial({
                color: 0xffffff
            });


        for (var i = 0; i <= segmentCount; i++) {
            var theta = (i / segmentCount) * Math.PI * 2;
            var vert = new Vector3(
                    Math.cos(theta) * radius,
                    Math.sin(theta) * radius,
                    0);
            geometry.vertices.push(vert);

        }
        var mesh = new Line(geometry, material);
        this.origVert = geometry.vertices;

        this.add(mesh);


    }
    updateColor() {
        //console.log(this.material);

    }

}