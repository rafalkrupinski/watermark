import sharp from "sharp";
import {Box, PlacedBox, Point2D} from "./types";

export class Doodle {
    canvas: sharp.Sharp
    takenBlocks: Point2D[]
    size: number // in blocks
    blockSize: Box
    meta: sharp.Metadata

    private constructor(
        canvas: sharp.Sharp,
        size: number,
        blockSize: Box,
        takenBlocks: Point2D[],
        meta: sharp.Metadata,
    ) {
        this.canvas = canvas;
        this.size = size;
        this.blockSize = blockSize;
        this.takenBlocks = takenBlocks;
        this.meta = meta;
    }

    static async create(
        canvas: sharp.Sharp,
        blockSize: Box,
        size: number,
    ) {
        const meta = await canvas.metadata();
        const taken = size == 1 ? [new Point2D(0, 0)] : await Doodle.getDoodleBlocks(canvas, blockSize, meta);

        return new Doodle(
            canvas,
            size,
            blockSize,
            taken,
            meta,
        )
    }

    static async getDoodleBlocks(canvas: sharp.Sharp, blockSize: Box, meta: sharp.Metadata): Promise<Point2D[]> {
        const blockCountX = Math.ceil(meta.width! / blockSize.width);
        const blockCountY = Math.ceil(meta.height! / blockSize.height);
        const blocks: Point2D[] = [];

        for (let y = 0; y < blockCountY; y++) {
            for (let x = 0; x < blockCountX; x++) {
                const blockTaken = await isBlockTaken(canvas, {
                    x: Math.floor(x * blockSize.width),
                    y: Math.floor(y * blockSize.height),
                    width: Math.floor(blockSize.width),
                    height: Math.floor(blockSize.height),
                })

                if (blockTaken) {
                    blocks.push(new Point2D(x, y));
                }
            }
        }

        return blocks;
    }
}

async function isBlockTaken(canvas: sharp.Sharp, box: PlacedBox): Promise<boolean> {
    const meta = await canvas.metadata();

    try {
        let c = canvas.clone(); // Clone the canvas to preserve the original image

        // Extract the alpha channel
        const alphaChannelData = await c.extractChannel(3).raw().toBuffer();

        // Calculate the starting position of the extracted rectangle in the alpha channel data
        const alphaStartIndex = box.y * meta.width! + box.x;

        // Check if any alpha values in the rectangle are greater than 0
        for (let y = 0; y < box.height; y++) {
            for (let x = 0; x < box.width; x++) {
                if (alphaChannelData[alphaStartIndex + y * meta.width! + x] > 0) {
                    return true;
                }
            }
        }

        return false;
    } catch (e) {
        console.error('Error while checking if block is taken', e);
        throw e;
    }
}
