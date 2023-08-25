export const handleClick = (event) => {
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




export const handleMouseDown = (event) => {
    if (event.button === 0) {
        isLeftMouseDown.current = true;
    } else if (event.button === 2) {
        isRightMouseDown.current = true;
    }
};

export const handleMouseUp = () => {
    isLeftMouseDown.current = false;
    isRightMouseDown.current = false;
    previousMousePosition.current = { x: 0, y: 0 };
};

export const handleMouseMove = (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    if (isLeftMouseDown.current) {
        const movementSpeed = 30;
        const camera = webCamera.current;
    if (previousMousePosition.current.x === 0 && previousMousePosition.current.y === 0) {
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
else if (isRightMouseDown.current) {
const camera = webCamera.current;
const movementSpeed = 0.002;
const { movementX, movementY } = event;

// 마우스 움직임에 따라 카메라의 회전 속도를 조절합니다.
const rotationSpeed = 0.002;
const deltaRotationX = -movementY * rotationSpeed;
const deltaRotationY = -movementX * rotationSpeed;

// 카메라의 현재 회전 값을 가져옵니다.
const currentRotation = camera.rotation.clone();

// 현재 회전 값에 따라 쿼터니언을 계산합니다.
const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);

// 회전 속도를 쿼터니언에 적용합니다.
const deltaQuaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaRotationX);
const deltaQuaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaRotationY);
quaternion.multiply(deltaQuaternionX).multiply(deltaQuaternionY);

// 카메라의 새로운 회전 값을 계산합니다.
const newRotation = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

// 카메라의 회전 값을 업데이트합니다.
camera.rotation.copy(newRotation);

// 이전 마우스 위치를 업데이트합니다.
previousMousePosition.current = { x: event.clientX, y: event.clientY };
}







};

const handleMouseWheel = (event) => {
event.preventDefault();

const delta = Math.max(-10, Math.min(10, event.deltaY));
const zoomSpeed = 8;

const camera = webCamera.current;

const forwardVector = new THREE.Vector3(0, 0, 10).applyQuaternion(camera.quaternion);
const movementVector = forwardVector.multiplyScalar(delta * zoomSpeed);

camera.position.add(movementVector);
};

const handleContextMenu = (event) => {
event.preventDefault();
};