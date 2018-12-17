/* eslint-disable */

// ==================== GLOBAL VARS ==================== //
var params = {
	lineColor: '#000',
	lineWidth: 5,
	fps: 15,
	scale: 2
}

var camera, scene, renderer, stats, currentTime, previousTime;
var geometry, testBoxMaterial, cube;
const normanMaterials = {};
var normanSceneHelper = {};

function init() {
	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 2;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// calculate time between two frames
	params.timeBetweenFrames = 1000 / params.fps;

	// add 3d
	addCube();
	initNorman();

	// add thick line
	// addLine();


	// add for timer
	previousTime = new Date();

	// add resizing
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();

	stats = new Stats();
	document.body.appendChild(stats.dom);
}



function animate() {
	requestAnimationFrame(animate);
	stats.update();

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.02;

	tickAnimation();

	renderer.render(scene, camera);

}

function addCube() {
	geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
	testBoxMaterial = new THREE.MeshNormalMaterial();

	cube = new THREE.Mesh(geometry, testBoxMaterial);
	scene.add(cube);

}

function addLine() {
	// // Position and Color Data
	// var positions = [];
	// var colors = [];
	// var points = hilbert3D(new THREE.Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);
	// console.log(points);
	// // points = [
	// // 	{x: -1, y: -1, z: -1},
	// // 	{x: 2, y: 2, z: 2}
	// // ]
	// var spline = new THREE.CatmullRomCurve3(points);
	// var divisions = Math.round(12 * points.length);
	// var color = new THREE.Color();
	// for (var i = 0, l = divisions; i < l; i++) {
	// 	var point = spline.getPoint(i / l);
	// 	positions.push(point.x, point.y, point.z);
	// 	color.setHSL(i / l, 1.0, 0.5);
	// 	colors.push(color.r, color.g, color.b);
	// }

	// // color = new THREE.Color("rgb(255, 0, 0)");
	// // THREE.Line2 ( LineGeometry, LineMaterial )
	// var geometry = new THREE.LineGeometry();
	// geometry.setPositions(positions);
	// geometry.setColors(colors);

	// matLine = new THREE.LineMaterial({
	// 	color: 0xffffff,
	// 	linewidth: 5, // in pixels
	// 	vertexColors: THREE.VertexColors,
	// 	//resolution:  // to be set by renderer, eventually
	// 	dashed: false
	// });

	// line = new THREE.Line2(geometry, matLine);
	// // line.computeLineDistances();
	// line.scale.set(1, 1, 1);
	// scene.add(line);

}


// ==================== FUNCTIONS NORMAN ==================== //

function initNorman() {
	var data = testData.compData
	// console.log(data);

	normanSceneHelper.frameIndex = 0
	normanSceneHelper.container = new THREE.Group()
	normanSceneHelper.innerContainer = new THREE.Group()
	normanSceneHelper.container.add(normanSceneHelper.innerContainer)

	normanSceneHelper.container.scale.set(params.scale, params.scale, params.scale)

	const material = getMaterial(params.lineColor)

	normanSceneHelper.clips = data.map(clip =>
		clip.map((frame, frameN) => {
			const geometry = new THREE.BufferGeometry()
			const positions = []
			const indices = []
			let nextIndex = 0

			frame.forEach(vertices => {
				if (!vertices.length) {
					return
				}

				const v = vertices[0]
				positions.push(v.x, v.y, v.z)
				nextIndex++

				vertices.forEach(v => {
					positions.push(v.x, v.y, v.z)
					indices.push(nextIndex - 1, nextIndex)
					nextIndex++
				})
			})

			geometry.setIndex(
				new THREE.BufferAttribute(new Uint16Array(indices), 1)
			)
			geometry.addAttribute(
				'position',
				new THREE.BufferAttribute(new Float32Array(positions), 3)
			)
			geometry.attributes.position.needsUpdate = true

			const mesh = new THREE.LineSegments(geometry, material)

			// @ vinni hier kann man mesh settings einstellen
			// console.log(mesh.material);
			// mesh.material.linewidth = 5
			// mesh.material.transparent = true
			// mesh.material.opacity = 0.4

			mesh.visible = frameN === 0
			normanSceneHelper.innerContainer.add(mesh)
			return mesh
		})
	)

	normanSceneHelper.frameIndices = new Array(normanSceneHelper.clips.length).fill(0)
	normanSceneHelper.frameLimits = normanSceneHelper.clips.map(clip => clip.length - 1)

	normanSceneHelper.container.name = "Animation"
	console.log(normanSceneHelper);
	scene.add(normanSceneHelper.container);

}

function getMaterial(color) {
	const key = color instanceof THREE.Color ? '#' + color.getHexString() : color

	if (normanMaterials[key]) {
		return normanMaterials[key]
	}
	normanMaterials[key] = new THREE.LineBasicMaterial({
		color,
		linewidth: 0,
	})
	return normanMaterials[key]
}

function tickAnimation(n = 1) {
	//Only run animation at fps
	currentTime = new Date();
	let timeDifference = currentTime - previousTime;
	if (timeDifference >= params.timeBetweenFrames) {
		previousTime = new Date();
		normanSceneHelper.clips.forEach((clip, i) => {
			const index = normanSceneHelper.frameIndices[i]
			const limit = normanSceneHelper.frameLimits[i]
			let next = index + n
			next = next > limit ? 0 : next < 0 ? limit : next

			clip[index].visible = false
			clip[next].visible = true
			normanSceneHelper.frameIndices[i] = next
		})
	}
}

// ==================== HELPER ==================== //
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== RUN ==================== //
init();
animate();