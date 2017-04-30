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
        mesh.material.transparent = true;
        mesh.geometry.verticesNeedUpdate = true;

        //create json object of vertices for deep clone of array
        var jsonVert = JSON.stringify(vertArr);
        this.origVert = JSON.parse(jsonVert);

        this.add(mesh);
    }

    updateVertices(offset) {
        for (var i = 0; i < this.children[0].geometry.vertices.length; i++) {
            var vert = this.children[0].geometry.vertices[i];
            if (Math.floor(Math.random() * 2) === 0) {
                vert.x += offset;
                vert.y += offset;
                vert.z += offset;
            } else {
                vert.x -= offset;
                vert.y -= offset;
                vert.z -= offset;
            }
        }
        this.children[0].geometry.verticesNeedUpdate = true;
    }

    resetVertices() {
        for (var i = 0; i < this.children[0].geometry.vertices.length; i++) {
            var vert = this.children[0].geometry.vertices;
            vert[i].x = this.origVert[i].x1;
            vert[i].y = this.origVert[i].y1;
            vert[i].z = this.origVert[i].z1;
        }
        this.children[0].geometry.verticesNeedUpdate = true;
    }

    updateOpacity(opVal) {
        this.children[0].material.opacity = opVal;
    }

}