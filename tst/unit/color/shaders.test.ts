import { describe, expect, it } from 'vitest';
import { glsl, wgsl } from '../../../src/color';

// GLSL `vec3 name(` and WGSL `fn name(` definitions in a snippet
const glslFunctions = (source: string) => [...source.matchAll(/^vec3 (\w+)\(/gm)].map((m) => m[1]);
const wgslFunctions = (source: string) => [...source.matchAll(/^fn (\w+)\(/gm)].map((m) => m[1]);

describe('glsl / wgsl', () => {
    it('offer the same snippets with the same function names in both languages', () => {
        expect(Object.keys(glsl).sort()).toEqual(Object.keys(wgsl).sort());
        for (const key of Object.keys(glsl) as (keyof typeof glsl)[]) {
            expect(glslFunctions(glsl[key])).toEqual(wgslFunctions(wgsl[key]));
        }
        expect(glslFunctions(glsl.oklab)).toEqual(['linearSrgbToOklab', 'oklabToLinearSrgb', 'mixOklab']);
    });

    it('never define a function twice, so snippets concatenate freely', () => {
        const names = Object.values(glsl).flatMap(glslFunctions);
        expect(new Set(names).size).toBe(names.length);
    });
});
