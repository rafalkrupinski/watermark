import {PRNG} from "seedrandom";
import {Box} from "./types";
import sharp from "sharp";
import {getRandomOpacity} from "./drawing";

const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'];

function getRandomUnicodeCharacter(randomGenerator: PRNG): string {
    while (true) {
        const text = String.fromCodePoint(Math.floor(randomGenerator() * 0xffff));
        if (/^[\p{L}\p{N}]$/u.test(text))
            return text;
    }
}

export async function getRandomUnicodeDoodle(randomGenerator: PRNG, size: Box): Promise<sharp.Sharp> {
    while(true) {
        const text = getRandomUnicodeCharacter(randomGenerator);
        const opacity = getRandomOpacity(randomGenerator);
        console.log('Opacity', opacity);

        console.log('Write text ', text)
        try {
            const ret = sharp({
                text: {
                    text: `<span color="#FFFFFF${opacity.toString(16)}">${text}</span>`,
                    font: fonts[randomGenerator() * fonts.length],
                    rgba: true,
                    ...size,
                }
            });
            await ret.toBuffer()
            console.log('OK.');
            return ret;
        } catch (e) {
            console.error('Error while creating character doodle for', text, e);

        }
    }
}