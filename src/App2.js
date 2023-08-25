import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
//...전역 함수 공간...//
//카메라 마우스 조작 부분

//클릭시 좌표데이터 얻어오는 함수(추후 return값 반환으로 다른 변수에 저장예정)
function handleClick(event){
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const camera = webCamera.current;

    // 마우스 클릭 위치를 정규화된 디바이스 좌표로 변환합니다.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycaster를 설정하여 클릭된 객체를 검사합니다.
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

function handleMouseDown(event) {
    if (event.button === 0) {
        isLeftMouseDown.current = true;
    }
    else if (event.button === 2) {
        isRightMouseDown.current = true;
    }
};



//.................//


//main 함수
function NodeLinkModel() {

    //카메라 초기 변수 지정
    const webCanvas = useRef(null);
    const webCamera = useRef(null);

    const isLeftMouseDown = useRef(false);
    const isRightMouseDown = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        //node, link가시화에 사용할 초기변수 지정

        let scene;
        let renderer;

        let cubes = [];
        let cubePosition = {};

        let nodeId = [];
        let nodeGuid = [];
        let nodeCategory = [];
        let nodeFamily = [];
        let nodeMinPosition = {};
        let nodeMaxPosition = {};

        let links = [];
        let linkId = [];
        let linkGuid = [];
        let linkStartNode = [];
        let linkEndNode = [];
        let linkStartNodeGuid = [];
        let linkEndNodeGuid = [];
        let linkCategory = [];
        let linkFamily = [];
        let linkPosition = {};
        let linkMinPosition = {};
        let linkMaxPosition = {};

        //초기화 함수
        const init = async () => {
            //링크,노드 생성및 적용 부분
            try{


            } catch (error) {
                console.error('Error reading file:', error);
            }

            if(webCanvas.current){
                webCanvas.current?.addEventListener('mousedown', handleMouseDown);
                webCanvas.current?.addEventListener('mouseup', handleMouseUp);
                webCanvas.current?.addEventListener('mousemove', handleMouseMove);
                webCanvas.current?.addEventListener('wheel', handleMouseWheel);
                webCanvas.current?.addEventListener('contextmenu', handleContextMenu);
                webCanvas.current?.addEventListener('click', handleClick);
            }
        };

    }, []);

    //html 문
    return(

    );
}

export default NodeLinkModel;