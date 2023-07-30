import {generateWatermark} from "./watermarkGenerator";

(async function (){
  await generateWatermark('image.png', 'watermarked_image.jpg');
})()
