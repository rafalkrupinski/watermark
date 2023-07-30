export interface Box {
    width: number
    height: number
}

export interface PlacedBox extends Box {
    x: number
    y: number
}

// Holds coordinates in pixels
export class Point2D {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromInt(int: number, width: number): Point2D {
        return new Point2D(
            int % width,
            Math.floor(int / width)
        );
    }

    add(point: Point2D): Point2D {
        return new Point2D(this.x + point.x, this.y + point.y);
    }

    toString(): string {
        return `${this.x}x${this.y}`;
    }

    toInt(width: number): number {
        return this.y * width + this.x
    }
}
