import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './App.css';

function NodeLinkModel() {
    //for display web
    const webCanvas = useRef(null);
    const webCamera = useRef(null);

    //for mouse state
    const isLeftMouseDown = useRef(false);
    const isRightMouseDown = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    //work with components render
    useEffect(() => {
        let scene;
        let renderer;

        //array for node
        let cubes = [];
        let cubeposition = [];
        let nodeId = [];
        let node_guid = [];
        let node_category_name = [];
        let node_family_name = [];
        let mbr_minn_position = [];
        let mbr_maxn_position = [];

        //array for link
        let links = [];
        const linkId = [];
        let link_guid = [];
        let link_s_n = [];
        let link_e_n = [];
        let link_s_n_guid = [];
        let link_e_n_guid = [];
        let link_category_name = [];
        let link_family_name = [];

        //array for mbr
        let linkposition = [];
        let mbr_minl_position = [];
        let mbr_maxl_position = [];


        const init = async () => {
            //create scene
            scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000000);
            webCamera.current = camera;

            renderer = new THREE.WebGLRenderer({ canvas: webCanvas.current, antialias: true });
            renderer.setSize(1366, 750);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.gammaOutput = true;

            try {
                //read node data
                const nodeResponse = await fetch('/data/nodem.txt');
                const nodeText = await nodeResponse.text();

                const nodeLines = nodeText.split('\n');

                //Data preprocessing(node)
                for (let i = 0; i < nodeLines.length; i++) {
                    const values = nodeLines[i].split('#');
                    nodeId[i] = parseInt(values[1]);
                    const coordinates = values[0].replace('POINTZ(', '').replace(')', '').split(' ').map(parseFloat);
                    const [x, y, z] = coordinates;
                    node_guid[nodeId[i]] = values[2];
                    node_category_name[nodeId[i]] = values[3];
                    node_family_name[nodeId[i]] = values[4];

                    const mbr_minnx = parseFloat(values[5]); //mbr data >> minx
                    const mbr_minny = parseFloat(values[6]); //mbr data >> miny
                    const mbr_minnz = parseFloat(values[7]); //mbr data >> minz

                    const mbr_maxnx = parseFloat(values[8]); //mbr data >> maxx
                    const mbr_maxny = parseFloat(values[9]); //mbr data >> maxy
                    const mbr_maxnz = parseFloat(values[10]); //mbr data >> maxz

                    //set cube coordinate and mbr
                    cubeposition[nodeId[i]] = { x, y, z }; //node center coordinate
                    mbr_minn_position[nodeId[i]] = { mbr_minnx, mbr_minny, mbr_minnz }; // mbr min data
                    mbr_maxn_position[nodeId[i]] = { mbr_maxnx, mbr_maxny, mbr_maxnz }; // mbr max data

                    const positionA = new THREE.Vector3(mbr_minn_position[nodeId[i]].mbr_minnx, mbr_minn_position[nodeId[i]].mbr_minny, mbr_minn_position[nodeId[i]].mbr_minnz);
                    const positionB = new THREE.Vector3(mbr_maxn_position[nodeId[i]].mbr_maxnx, mbr_maxn_position[nodeId[i]].mbr_maxny, mbr_maxn_position[nodeId[i]].mbr_maxnz);

                    //calc node length
                    const width = Math.abs(positionB.x - positionA.x);
                    const height = Math.abs(positionB.y - positionA.y);
                    const depth = Math.abs(positionB.z - positionA.z);
                    const center = new THREE.Vector3(
                        (mbr_minn_position[nodeId[i]].mbr_minnx + (width / 2)),
                        (mbr_minn_position[nodeId[i]].mbr_minny + (height / 2)),
                        (mbr_minn_position[nodeId[i]].mbr_minnz + (depth / 2))
                    ); //Create a central coordinate using mbr data

                    //set node color
                    const geometry = new THREE.BoxGeometry(width, height, depth);
                    let color;
                    switch (node_category_name[nodeId[i]]) {
                        case '구조 프레임':
                            color = 0xF3925A;
                            break;
                        case '배관 밸브류':
                            color = 0xFF4848;
                            break;
                        case '배관 부속류':
                            color = 0xB2EBF4;
                            break;
                        case '구조 기둥':
                            color = 0x993800;
                            break;
                        case '기계 장비':
                            color = 0x747474;
                            break;
                        case '일반 모델':
                            color = 0xFFFFFF;
                            break;
                        default:
                            color = 0x000000;
                            break;
                    }
                    //create cube
                    const material = new THREE.MeshBasicMaterial({ color: color });
                    const cube = new THREE.Mesh(geometry, material);

                    //create cube outline
                    const edges = new THREE.EdgesGeometry(geometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x353535, linewidth: 2 });
                    const wireframe = new THREE.LineSegments(edges, edgesMaterial);

                    //add node to scene
                    cube.position.copy(center);
                    cube.add(wireframe);
                    cubes.push(cube);
                    scene.add(cube);
                }

                //read link data
                const linkResponse = await fetch('/data/linkm.txt');
                const linkText = await linkResponse.text();
                const link_Lines = linkText.split('\n');
                for (let i = 0; i < link_Lines.length; i++) {

                    const values1 = link_Lines[i].split('#');
                    linkId[i] = parseInt(values1[1]);

                    const coordinates1 = values1[0].replace('LINESTRINGZ(', '').replace(')', '').replace(',', ' ').split(' ').map(parseFloat);
                    const [x1, y1, z1, x2, y2, z2] = coordinates1;

                    link_guid[linkId[i]] = values1[2];
                    link_s_n[linkId[i]] = parseInt(values1[3]); //start_node_id
                    link_e_n[linkId[i]] = parseInt(values1[4]); //end_node_id
                    link_s_n_guid[linkId[i]] = values1[5]; //start_node_guid
                    link_e_n_guid[linkId[i]] = values1[6]; //end_node_guid
                    link_category_name[linkId[i]] = values1[7];
                    link_family_name[linkId[i]] = values1[8];

                    const mbr_minlx = parseFloat(values1[9]); // mbr data >> minx
                    const mbr_minly = parseFloat(values1[10]); // mbr data >> miny
                    const mbr_minlz = parseFloat(values1[11]); // mbr data >> minz

                    const mbr_maxlx = parseFloat(values1[12]); // mbr data >> maxx
                    const mbr_maxly = parseFloat(values1[13]); // mbr data >> maxy
                    const mbr_maxlz = parseFloat(values1[14]); // mbr data >> maxz

                    linkposition[linkId[i]] = { x1, y1, z1}; //Use of range values to rotate repetitive statements when creating links
                    mbr_minl_position[linkId[i]] = { mbr_minlx, mbr_minly, mbr_minlz }; //mbr min data
                    mbr_maxl_position[linkId[i]] = { mbr_maxlx, mbr_maxly, mbr_maxlz }; // mbr max data
                }

                //set camera
                camera.position.x = cubeposition[1].x + 20000;
                camera.position.y = cubeposition[1].y + 10000;
                camera.rotation.y = Math.PI / 2;
                camera.rotation.z = Math.PI / 2;
                camera.position.z = cubeposition[1].z + 1000;

                //create pipes
                let material1;
                for (let i = 1; i <= Object.keys(linkposition).length; i++) {
                    const positionA1 = new THREE.Vector3(mbr_minl_position[i].mbr_minlx, mbr_minl_position[i].mbr_minly, mbr_minl_position[i].mbr_minlz);
                    const positionB1 = new THREE.Vector3(mbr_maxl_position[i].mbr_maxlx, mbr_maxl_position[i].mbr_maxly, mbr_maxl_position[i].mbr_maxlz);

                    //calc pipe length
                    const width1 = Math.abs(positionB1.x - positionA1.x);
                    const height1 = Math.abs(positionB1.y - positionA1.y);
                    const depth1 = Math.abs(positionB1.z - positionA1.z);
                    const center1 = new THREE.Vector3(
                        (mbr_minl_position[i].mbr_minlx + (width1 / 2)),
                        (mbr_minl_position[i].mbr_minly + (height1 / 2)),
                        (mbr_minl_position[i].mbr_minlz + (depth1 / 2))
                    );

                    //create pipe box
                    const geometry1 = new THREE.BoxGeometry(width1, height1, depth1);
                    material1 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
                    const pipe = new THREE.Mesh(geometry1, material1);

                    //create pipe outline
                    const edges1 = new THREE.EdgesGeometry(geometry1);
                    const edgesMaterial1 = new THREE.LineBasicMaterial({ color: 0x353535, linewidth: 2 });
                    const wireframe1 = new THREE.LineSegments(edges1, edgesMaterial1);

                    //set pipe
                    pipe.position.copy(center1);
                    pipe.add(wireframe1);
                    scene.add(pipe);
                }
                const ambientLight = new THREE.AmbientLight(0xffffff, 1);
                scene.add(ambientLight);

            } catch (error) {
                console.error('Error reading file:', error);
            }

            webCanvas.current?.addEventListener('mousedown', handleMouseDown);
            webCanvas.current?.addEventListener('mouseup', handleMouseUp);
            webCanvas.current?.addEventListener('mousemove', handleMouseMove);
            webCanvas.current?.addEventListener('wheel', handleMouseWheel);
            webCanvas.current?.addEventListener('contextmenu', handleContextMenu);
            webCanvas.current?.addEventListener('click', handleClick);
        };

        //mouse click to object
        const handleClick = (event) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const camera = webCamera.current;

            //transform mouse coordinate to device coordinate
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const { object } = intersects[0];
                const box = new THREE.Box3().setFromObject(object);
                const center = new THREE.Vector3();
                box.getCenter(center);
                const min = box.min;
                const max = box.max;

                console.log('Clicked object center position (X, Y, Z):', center.x, center.y, center.z);
                console.log('Clicked object minimum position (X, Y, Z):', min.x, min.y, min.z);
                console.log('Clicked object maximum position (X, Y, Z):', max.x, max.y, max.z);
            }
        };

        //which mouse button down
        const handleMouseDown = (event) => {
            if (event.button === 0) {
                isLeftMouseDown.current = true;
            } else if (event.button === 2) {
                isRightMouseDown.current = true;
            }
        };
        //Reset mouse values
        const handleMouseUp = () => {
            isLeftMouseDown.current = false;
            isRightMouseDown.current = false;
            previousMousePosition.current = { x: 0, y: 0 };
        };
        //mouse movement event
        const handleMouseMove = (event) => {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            //Left mouse pressed and moved to change camera position
            if (isLeftMouseDown.current) {
                const movementSpeed = 30;
                const camera = webCamera.current;

                if (
                    previousMousePosition.current.x === 0 &&
                    previousMousePosition.current.y === 0
                ) {
                    previousMousePosition.current = { x: mouseX, y: mouseY };
                    return;
                }

                const deltaX = previousMousePosition.current.x - mouseX;
                const deltaY = previousMousePosition.current.y - mouseY;

                const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(camera.quaternion);
                const movementVector = new THREE.Vector3(deltaX, -deltaY, 0).applyMatrix4(rotationMatrix);

                camera.position.add(movementVector.multiplyScalar(movementSpeed));

                previousMousePosition.current = { x: mouseX, y: mouseY };
            }
            //camera rotation
            //TODO
            //There is a problem that does not work normally when moving the screen from side to side when rotating, so it needs to be corrected.
            else if (isRightMouseDown.current) {
                const camera = webCamera.current;
                const movementSpeed = 0.002;
                const { movementX, movementY } = event;

                const rotationSpeed = 0.002;
                const deltaRotationX = -movementY * rotationSpeed;
                const deltaRotationY = -movementX * rotationSpeed;

                const currentRotation = camera.rotation.clone();

                const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);

                const deltaQuaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaRotationX);
                const deltaQuaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaRotationY);
                quaternion.multiply(deltaQuaternionX).multiply(deltaQuaternionY);

                const newRotation = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

                camera.rotation.copy(newRotation);

                previousMousePosition.current = { x: event.clientX, y: event.clientY };
            }
        };

        //zoom in / zoom out
        const handleMouseWheel = (event) => {
            event.preventDefault();

            const delta = Math.max(-10, Math.min(10, event.deltaY));
            const zoomSpeed = 8;

            const camera = webCamera.current;

            const forwardVector = new THREE.Vector3(0, 0, 10).applyQuaternion(camera.quaternion);
            const movementVector = forwardVector.multiplyScalar(delta * zoomSpeed);

            camera.position.add(movementVector);
        };

        //block contextMenu - mouse right click
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        //update render
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, webCamera.current);
        };

        init();
        animate();
    }, []);

    return (
        <html>
        <head>
            <title>Test</title>
            <style>

            </style>
        </head>

        <body>
        <header>
            <div>
                <h1>리얼타임테크 Geometry Data Viewer</h1>
            </div>
            <div
                className="container"
                style={{
                    border: "3px solid black",
                    padding: "10px",
                    margin: "20px",
                    width: "300px",
                    height: "750px",
                    float: "left",

                }}
            >
                <h5>
                    property panel
                </h5>

                <div
                    className="container"
                    style={{
                        border: "4px solid black",
                        padding: "10px",
                        width: "250px",
                        height: "300px",
                        float: "center",
                        margin: "0 auto",
                    }}
                >
                </div>

                <h5>
                    객체 바로가기
                </h5>

                <select
                    name="node_id"
                    style={{
                        width: "250px",
                        height: "50px",
                        fontSize: "20px",
                    }}
                    className="custom-select"
                >
                    <option value="node_id" selected>
                        node_id
                    </option>
                </select>

                <select
                    name="link_id"
                    style={{
                        width: "250px",
                        height: "50px",
                        fontSize: "20px",
                    }}
                    className="custom-select2"
                >
                    <option value="link_id" selected>
                        link_id
                    </option>
                </select>
            </div>

            <div
                style={{
                    border: "3px solid black",
                    padding: "10px",
                    margin: "20px",
                    width: "1366px",
                    height: "750px",
                    float: "left",
                }}
            >
                <canvas ref={webCanvas} />
            </div>
            <div
                style={{
                    paddingTop: "20px",
                }}
            >
            </div>
        </header>
        <br />

        <footer
            style={{
                height: "75px",
                minHeight: "75px",
                color: "#696969",
                backgroundColor: "#B2EBF4",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div>
                <p>Copyright 2023 RealTimeTech all rights reserved.</p>
            </div>
        </footer>
        </body>
        </html>
    );
}

export default NodeLinkModel;