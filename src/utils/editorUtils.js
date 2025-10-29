export const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/webp', 0.9));

export const generateLayoutGroupId = () => `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
