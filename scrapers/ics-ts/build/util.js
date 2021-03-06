"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepInRange = exports.falseyToNull = void 0;
const falseyToNull = (obj) => {
    const transformed = { ...obj };
    Object.entries(transformed).forEach((k, v) => {
        if (typeof v !== "number" && !v)
            transformed[k] = null;
    });
    return transformed;
};
exports.falseyToNull = falseyToNull;
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const sleepInRange = async (min, max) => await new Promise((resolve) => setTimeout(resolve, getRandomInt(min, max)));
exports.sleepInRange = sleepInRange;
