export function randomNum(startNum: number, endNum: number): number {
  return Math.floor(Math.random() * (endNum - startNum + 1));
}
