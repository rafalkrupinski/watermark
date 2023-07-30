import seedrandom, {PRNG} from "seedrandom";
import sharp from "sharp";
import {createHash} from "crypto";
import {Box} from "./types";

export class Canvas {
    canvas: sharp.Sharp
    blockSize: Box
    randomGenerator: PRNG
    canvasSizeInBlocks: Box
    meta: sharp.Metadata

    private constructor(
        canvas: sharp.Sharp,
        blockSize: Box,
        randomGenerator: PRNG,
        canvasSize: Box,
        meta: sharp.Metadata,
    ) {
        this.canvas = canvas;
        this.blockSize = blockSize;
        this.randomGenerator = randomGenerator;
        this.canvasSizeInBlocks = canvasSize;
        this.meta = meta;
    }

    static async create(path: string): Promise<Canvas> {
        const canvas = sharp(path);

        const meta = await canvas.metadata();
        // console.log('Input metadata', meta);
        if (!meta.width || !meta.height)
            throw new Error('Missing input image dimensions');

        const blockSize = await selectBlockSize(meta as Box);

        const canvasSize = {
            width: Math.floor(meta.width / blockSize.width),
            height: Math.floor(meta.height / blockSize.height),
        };

        const seed = await canvas.toBuffer()
            .then(buffer =>
                createHash('sha512')
                    .update(buffer)
                    .digest('hex')
            );

        const randomGenerator = seedrandom(seed);

        return new Canvas(
            canvas,
            blockSize,
            randomGenerator,
            canvasSize,
            meta,
        )
    }
}

function blockSize1(dim: number): number {
    const numBlocks = Math.floor(dim / 50);
    return dim / numBlocks;
}

async function selectBlockSize(meta: Box): Promise<Box> {
    return {
        width: blockSize1(meta.width),
        height: blockSize1(meta.height),
    }
}
