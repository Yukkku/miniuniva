export class Camera {
    #p: [number, number, number] = [0, 0, 0];
    #r: [number, number, number, number] = [1, 0, 0, 0];

    rotter() {
        const a = this.#p[0];
        const b = this.#p[1];
        const c = this.#p[2];

        const axx = 1 - 2 * (this.#r[2] ** 2 + this.#r[3] ** 2);
        const axy = 2 * (this.#r[1] * this.#r[2] - this.#r[0] * this.#r[3]);
        const axz = 2 * (this.#r[1] * this.#r[3] + this.#r[0] * this.#r[2]);

        const ayy = 1 - 2 * (this.#r[3] ** 2 + this.#r[1] ** 2);
        const ayz = 2 * (this.#r[2] * this.#r[3] - this.#r[0] * this.#r[1]);
        const ayx = 2 * (this.#r[2] * this.#r[1] + this.#r[0] * this.#r[3]);

        const azz = 1 - 2 * (this.#r[1] ** 2 + this.#r[2] ** 2);
        const azx = 2 * (this.#r[3] * this.#r[1] - this.#r[0] * this.#r[2]);
        const azy = 2 * (this.#r[3] * this.#r[2] + this.#r[0] * this.#r[1]);

        return (x: number, y: number, z: number) => {
            const p = x - a;
            const q = y - b;
            const r = z - c;
            return [
                p * axx + q * axy + r * axz,
                p * ayx + q * ayy + r * ayz,
                p * azx + q * azy + r * azz,
            ] as [number, number, number];
        };
    }
    dirReset() {
        this.#r = [1, 0, 0, 0];
    }

    dister() {
        const a = this.#p[0];
        const b = this.#p[1];
        const c = this.#p[2];

        return (x: number, y: number, z: number) =>
            Math.hypot(x - a, y - b, z - c);
    }

    rotX(v: number) {
        const cos = Math.cos(v / 2);
        const sin = Math.sin(v / 2);
        this.#set(
            cos * this.#r[0] - sin * this.#r[1],
            cos * this.#r[1] + sin * this.#r[0],
            cos * this.#r[2] - sin * this.#r[3],
            cos * this.#r[3] + sin * this.#r[2],
        );
    }
    rotY(v: number) {
        const cos = Math.cos(v / 2);
        const sin = Math.sin(v / 2);
        this.#set(
            cos * this.#r[0] - sin * this.#r[2],
            cos * this.#r[1] + sin * this.#r[3],
            cos * this.#r[2] + sin * this.#r[0],
            cos * this.#r[3] - sin * this.#r[1],
        );
    }
    rotZ(v: number) {
        const cos = Math.cos(v / 2);
        const sin = Math.sin(v / 2);
        this.#set(
            cos * this.#r[0] - sin * this.#r[3],
            cos * this.#r[1] - sin * this.#r[2],
            cos * this.#r[2] + sin * this.#r[1],
            cos * this.#r[3] + sin * this.#r[0],
        );
    }
    walk(s: number) {
        this.#p[0] += 2 * s *
            (this.#r[1] * this.#r[3] - this.#r[0] * this.#r[2]);
        this.#p[1] += 2 * s *
            (this.#r[2] * this.#r[3] + this.#r[0] * this.#r[1]);
        this.#p[2] += s - 2 * s * (this.#r[1] ** 2 + this.#r[2] ** 2);
    }

    #set(d: number, i: number, j: number, k: number) {
        const g = Math.hypot(d, i, j, k);
        this.#r = [d / g, i / g, j / g, k / g];
    }

    makeReal() {}
}
