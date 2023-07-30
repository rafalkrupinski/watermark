import sharp from "sharp";
import {PRNG} from "seedrandom";
import {Canvas} from "./canvas";
import {findAvailableBlock, getRandomRotation} from "./drawing";
import {Box} from "./types";
import {Doodle} from "./doodle";
import {getRandomSVG} from "./doodleSVG";
import {getRandomUnicodeDoodle} from "./doodleText";


async function generateSingleDoodle(
    randomGenerator: PRNG,
    doodleSize: number,
    blockSize: Box
): Promise<Doodle> {
    const isSVG = randomGenerator() < 0.5; // Randomly choose SVG or Unicode character
    const canvasSize = {
        width: Math.floor(doodleSize * blockSize.width),
        height: Math.floor(doodleSize * blockSize.height),
    };
    const canvas = isSVG
        ? await getRandomSVG(randomGenerator, canvasSize)
        : (await getRandomUnicodeDoodle(randomGenerator, canvasSize))
            .rotate(getRandomRotation(randomGenerator), {background: '#FFFFFF00'});
    return await Doodle.create(
        canvas.rotate(),
        blockSize,
        doodleSize,
    );
}

export async function generateWatermark(inputImagePath: string, outputImagePath: string) {
    const canvas = await Canvas.create(inputImagePath);
    console.log('block size', canvas.blockSize);
    console.log('canvas size', canvas.meta.width, canvas.meta.height, canvas.canvasSizeInBlocks);

    const watermark: sharp.OverlayOptions[] = [];
    const blocksFree = new Set<number>();
    for (let i = 0; i < canvas.canvasSizeInBlocks.width * canvas.canvasSizeInBlocks.height; i++) {
        blocksFree.add(i);
    }

    // Loop through different doodle sizes from largest to smallest
    for (let doodleIndex = 0, doodleSize = Math.min(canvas.canvasSizeInBlocks.width, canvas.canvasSizeInBlocks.width, 16); doodleSize > 0; doodleSize = Math.floor(doodleSize / 2), doodleIndex++) {
        console.log('doodle size', doodleSize);
        while (blocksFree.size > 0) {
            if (blocksFree.has(undefined as any as number))
                throw new Error('undefined in blocksFree')
            const doodle = await generateSingleDoodle(canvas.randomGenerator, doodleSize, canvas.blockSize);
            const result = findAvailableBlock(doodle, canvas.canvasSizeInBlocks, canvas.randomGenerator, blocksFree);
            if (!result) break;
            const {startingBlock, blocksTaken: doodleBlocks} = result;
            console.log('doodle blocks', ...doodleBlocks)
            console.log('before - free blocks left:', blocksFree.size);
            doodleBlocks.forEach(b => blocksFree.delete(b))
            console.log('after - free blocks left:', blocksFree.size);
            if (blocksFree.size>0 && blocksFree.values().next().value === undefined) throw new Error('undefined in blocksFree');


            const {x, y} = startingBlock;

            const item = {
                input: await doodle.canvas.png().toBuffer(),
                left: Math.floor(x * canvas.blockSize.width),
                top: Math.floor(y * canvas.blockSize.height),
                blend: 'atop',
            } as sharp.OverlayOptions;
            console.log('doodle placement', `${item.left}x${item.top}`);
            watermark.push(item)
        }
    }

    console.log('create watermarked');

    const background = await canvas.canvas.ensureAlpha().toBuffer().then(sharp).then(img => img.raw());

    const watermarked = background.composite(watermark);
    await watermarked.toBuffer();

    console.log('Write output')

    await watermarked.png().toFile(outputImagePath);
}
