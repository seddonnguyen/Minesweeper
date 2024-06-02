function drawImage(context, image, x, y, size) {

    image.onload = () => {
        context.drawImage(image, x, y, size, size);
    };
    if (image.complete) {
        context.drawImage(image, x, y, size, size);
    }
}

export { drawImage };