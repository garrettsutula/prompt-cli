export function getRandomInt(min = 1, max = Number.MAX_SAFE_INTEGER) {
 min = Math.ceil(min);
 max = Math.floor(max);
 return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}