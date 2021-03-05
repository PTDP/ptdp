export const falseyToNull = (obj) => {
    const transformed = { ...obj };
    Object.entries(transformed).forEach((k: any, v) => {
        if (typeof v !== "number" && !v) (transformed as any)[k] = null;
    });
    return transformed;
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const sleepInRange = async (min, max) =>
    await new Promise((resolve) => setTimeout(resolve, getRandomInt(min, max)));
