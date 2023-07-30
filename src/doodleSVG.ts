import {PRNG} from "seedrandom";
import path from "path";
import fs from "fs";
import {Box} from "./types";
import sharp from "sharp";
import {DOMParser, XMLSerializer} from "@xmldom/xmldom";
import {getRandomOpacity, getRandomRotation} from "./drawing";

async function getRandomSVGFile(randomGenerator: PRNG): Promise<string> {
    const iconsDir = path.join(path.dirname(require.resolve('@tabler/icons')), '../../icons');
    const files = await fs.promises.readdir(iconsDir);
    return path.join(
        iconsDir,
        files[Math.floor(randomGenerator() * files.length)]
    );
}

function prepareSVG(svgCode: string, size: Box, opacity: number, rotation: number): string {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Get the current width and height attributes
    const originalWidth = parseFloat(svgElement.getAttribute('width')!);
    const originalHeight = parseFloat(svgElement.getAttribute('height')!);

    const scale = Math.min(size.width / originalWidth, size.height / originalHeight);

    // Calculate the new width and height
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;

    // Update the width and height attributes
    svgElement.setAttribute('width', newWidth.toString());
    svgElement.setAttribute('height', newHeight.toString());
    svgElement.setAttribute('viewBox', `0 0 ${newWidth} ${newHeight}`);

    // Create a new <g> (group) element
    const groupElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Move all children of <svg> to the new <g> element
    while (svgElement.firstChild) {
        const child = svgElement.firstChild;
        svgElement.removeChild(child);
        groupElement.appendChild(child);
    }

    // Apply a scaling transformation to the SVG contents
    const transformValue = `rotate(${rotation}) scale(${scale})`;
    groupElement.setAttribute('transform', transformValue);
    groupElement.setAttribute('color', `#ffffff`);
    groupElement.setAttribute('stroke-opacity', (opacity/256).toString());
    // groupElement.setAttribute('opacity', '.5');
    svgElement.appendChild(groupElement);

    // Serialize the modified SVG back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc);
}

export async function getRandomSVG(randomGenerator: PRNG, size: Box): Promise<sharp.Sharp> {
    const svgIcon = await getRandomSVGFile(randomGenerator);
    console.log('SVG doodle', svgIcon)
    const svgText = await fs.promises.readFile(svgIcon, 'utf8')
        .then(text => prepareSVG(text, size, getRandomOpacity(randomGenerator), getRandomRotation(randomGenerator)));
    // console.log(svgText);
    return sharp(Buffer.from(svgText));
}