// rollup.config.mjs
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';
// import multi from '@rollup/plugin-multi-entry';
import buble from 'rollup-plugin-buble';
import sizes from 'rollup-plugin-sizes';
// import html from '@rollup/plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'src/index.ts',
	external: [],
	output: [
		{
			file: 'public/dist/bundle.js',
			format: 'cjs',
			globals: {},
		},
		{
			file: 'dist/bundle.min.js',
			format: 'cjs',
			globals: {},
			plugins: [terser()]
		}
	],
	plugins: [typescript(), json(), nodeResolve({
		// exportConditions: ['node']
	}), commonjs(
		// {
		// 	dynamicRequireTargets: [
		// 		// include using a glob pattern (either a string or an array of strings)
		// 		'node_modules/shelljs/**/*.js',

		// 		// exclude files that are known to not be required dynamically, this allows for better optimizations
		// 		'!node_modules/shelljs/node_modules/*',
		// 		'node_modules/shelljs/package/shell.js',
		// 	]
		// }
	), sizes()]
};
// , html(), buble(), sizes(), json(),, nodeResolve(),nodePolyfills(),, multi()
// buble({ transforms: { dangerousForOf: true } }),