export const mapNodeToScreen = (node) => {
    const screenX = (node.x * window.innerHeight);
    const screenY = (node.y * window.innerHeight);
    return {x: screenX, y: screenY, z: 0};
};
