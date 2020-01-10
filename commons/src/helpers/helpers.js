'use strict'

// Take an image URL, downscale it to the given width, and return a new image URL.
const downScaleImage = (dataUrl, newWidth = 350, imageType = 'image/jpeg', imageArguments = 0.7) => new Promise((resolve, reject) => {

    let image;
    let oldWidth;
    let oldHeight;
    let newHeight;
    let canvas;
    let ctx;
    let newDataUrl;

    // Create a temporary image so that we can compute the height of the downscaled image.
    image = new Image();
    image.src = dataUrl;
    
    // Wait for image to be loaded
    image.onload = function () {
        console.log('loaded')
        oldWidth = image.width;
        oldHeight = image.height;
        newHeight = Math.floor(oldHeight / oldWidth * newWidth)

        // Create a temporary canvas to draw the downscaled image on.
        canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the downscaled image on the canvas and return the new data URL.
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        newDataUrl = canvas.toDataURL(imageType, imageArguments);

        resolve(newDataUrl);
    }   

});

const downScaleImageFromFile = (file, newWidth = 350, imageType = 'image/jpeg', imageArguments = 0.7) => new Promise((resolve, reject) => {

    let image;
    let oldWidth;
    let oldHeight;
    let newHeight;
    let canvas;
    let ctx;
    let newDataUrl;
    let reader;

    reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
        // Create a temporary image so that we can compute the height of the downscaled image.
        image = new Image();
        image.src = reader.result;
        
        // Wait for image to be loaded
        image.onload = function () {
            console.log('loaded')
            oldWidth = image.width;
            oldHeight = image.height;
            newHeight = Math.floor(oldHeight / oldWidth * newWidth)

            // Create a temporary canvas to draw the downscaled image on.
            canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the downscaled image on the canvas and return the new data URL.
            ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, newWidth, newHeight);
            newDataUrl = canvas.toDataURL(imageType, imageArguments);

            resolve(newDataUrl);
        }
    };  

});

export { downScaleImage, downScaleImageFromFile };