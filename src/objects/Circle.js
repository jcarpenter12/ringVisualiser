import {
    Object3D,
    CircleBufferGeometry,
    LineBasicMaterial,
    Geometry,
    Line,
    Vector3,
    Math as tMath,
    Mesh
} from 'three';

var mesh = null;

export default class Circle extends Object3D {
    constructor() {
        super();
        this.origVert = [];
        const vertArr = [];
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
            //this is used to remove only the numeric values of the Vector and not the object
            var obj = {
                x1: vert.x,
                y1: vert.y,
                z1: vert.z
            };
            vertArr.push(obj);

        }

        mesh = new Line(geometry, material);

        //create json object of vertices for deep clone of array
        var jsonVert = JSON.stringify(vertArr);
        this.origVert = JSON.parse(jsonVert);

        this.add(mesh);
    }

}