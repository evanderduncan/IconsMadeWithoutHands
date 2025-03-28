//This code attempts to draw the movement of someone using a laundrette in Japan. The pixel manipulation works by comparing the current pixels with previous pixels, drawing only pixels that have met a threshold of change. The rest of the pixels that haven't changed values are made transparent. I use lerp and BLEND filter to create a ghostly data trail effect. I had the live CCTV feed running in a local host and could get the footage to run ok in the p5 editor - but when I tried to manipulate the pixels it refused to load. My workaround was to take a minute long clip of the live footage as example visuals. 

let video;
let prevFrame;
let diffFrame;
let firstFrame;
let diffThreshold = 45;
let fadeFactor = 30; // controls how long trails last
let isFirstFrameCaptured = false; //boolean for checking when video loads

function setup() {
  createCanvas(640, 480);
  pixelDensity(1); //for pixel manipulation

  //loading video file
  video = createVideo("3.mp4");
  video.size(width, height);
  video.hide();
  video.loop();
  video.volume(0);

  // I used the two layers technique for the video feedback effect from https://p5js.org/tutorials/layered-rendering-with-framebuffers/
  prevFrame = createGraphics(640, 480);
  diffFrame = createGraphics(640, 480);
  // Sometimes there a really weird glitch that draws this frame as a 1/4 of the size in the top left. It only started happening after I introduced the lerpColor. Really not sure why but when I reduced the x from 640 to 639 it redrew well enough - you might need to do the same.
  firstFrame = createGraphics(639, 480);

  diffFrame.clear();
}

function draw() {
  //checking if video has loaded and valid
  //draws first frame of video onto createGraphics buffer as initial     reference.
  if (video.loadedmetadata && video.width > 0) {
    if (!isFirstFrameCaptured) {
      firstFrame.image(video, 0, 0, width, height);
      prevFrame.image(video, 0, 0, width, height);
      isFirstFrameCaptured = true;
      return;
    }

    //load data for each object before access pixel array
    //live pixel information from video file
    video.loadPixels();
    prevFrame.loadPixels();
    diffFrame.loadPixels();

    //calculating index of pixel value as taught in class.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let i = (y * width + x) * 4;

        //find RGB values of pixels from current frame
        let currentR = video.pixels[i];
        let currentG = video.pixels[i + 1];
        let currentB = video.pixels[i + 2];

        //find RGB values of pixels from previous frame
        let previousR = prevFrame.pixels[i];
        let previousG = prevFrame.pixels[i + 1];
        let previousB = prevFrame.pixels[i + 2];

        //subtracting to find difference. Used Math.abs function to return a postive value as without it the diffThreshhold was never being met and pixels weren't being drawn.
        let diff =
          abs(currentR - previousR) +
          abs(currentG - previousG) +
          abs(currentB - previousB);

        if (diff > diffThreshold) {
          let prevDiffColour = diffFrame.get(x, y); // get existing colour
          let blendedColour = lerpColor(
            color(prevDiffColour),
            color(currentR, currentG, currentB),
            0.45
          ); // blending the new frame with the old
          diffFrame.set(x, y, blendedColour);
        }
      }
    }

    // fade older trails slowly
    diffFrame.filter(BLUR, 1);
    diffFrame.updatePixels();

    // draw first frame as background
    image(firstFrame, 0, 0, width, height);

    // overlying the next frame with difference frame to show difference
    image(diffFrame, 0, 0, width, height);

    // update previous frame for the next loop
    prevFrame.image(video, 0, 0, width, height);
  }
  //}
}
