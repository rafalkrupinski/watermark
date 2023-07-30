import {Box, Point2D} from "./types";
import {Doodle} from "./doodle";
import {PRNG} from "seedrandom";

interface AvailableBlockResult {
    startingBlock: Point2D
    blocksTaken: Set<number>
}

export function findAvailableBlock(doodle: Doodle, sizeInBlocks: Box, random: PRNG, blocksFree: Set<number>): AvailableBlockResult | undefined {
    for (let tries = 0; tries < 10 && blocksFree.size > 0; tries++) {
        const blockNum =  Array.from(blocksFree)[Math.floor(random() * blocksFree.size)];
        console.log('Trying', blockNum);

        const doodleStartingBlock = Point2D.fromInt(blockNum, sizeInBlocks.width);

        const doodleEndBlock = doodleStartingBlock.add(new Point2D(doodle.size, doodle.size));
        console.log(blockNum, '->', doodleStartingBlock, doodleEndBlock);

        if (
            doodleEndBlock.x > sizeInBlocks.width + 1 ||
            doodleEndBlock.y > sizeInBlocks.height + 1
        ) {
            console.log('out of bounds')
            continue;
        }

        const doodleBlocks = doodle
            .takenBlocks
            .map(block => block.add(doodleStartingBlock))
            .map(b => b.toInt(sizeInBlocks.width))
        ;

        if (doodleBlocks.every(b => blocksFree.has(b)))
            return {startingBlock: doodleStartingBlock, blocksTaken: new Set(doodleBlocks)};
        else
            console.log('block conflict');
    }
}

export function getRandomOpacity(random: PRNG): number {
    const low = 50;
    const high = 77
    return Math.floor(random() * (high - low) + low);
}

export function getRandomRotation(random: PRNG): number {
    // fully random rotations are slow and need better scaling
    // return random() * 360;
    return Math.floor(random() * 4) * 90;
}
