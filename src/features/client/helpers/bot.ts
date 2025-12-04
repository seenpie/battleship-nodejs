import { generateId } from "@/utils/generate-id";
import { randomNum } from "@/utils/random-num";
import process from "process";

export const BOT_MOVE_DELAY = Number(process.env.BOT_MOVE_DELAY) || 2000;

export const botShipsData1 =
  '[{"position":{"x":0,"y":7},"direction":false,"type":"huge","length":4},{"position":{"x":4,"y":2},"direction":true,"type":"large","length":3},{"position":{"x":5,"y":7},"direction":false,"type":"large","length":3},{"position":{"x":7,"y":3},"direction":true,"type":"medium","length":2},{"position":{"x":0,"y":2},"direction":false,"type":"medium","length":2},{"position":{"x":0,"y":5},"direction":false,"type":"medium","length":2},{"position":{"x":9,"y":7},"direction":false,"type":"small","length":1},{"position":{"x":9,"y":2},"direction":false,"type":"small","length":1},{"position":{"x":9,"y":5},"direction":false,"type":"small","length":1},{"position":{"x":4,"y":0},"direction":true,"type":"small","length":1}]';

const botShipsDataList = [botShipsData1];

export function createBot(): Bot {
  return new Bot();
}

export function getBotShipsData() {
  const lastItemId = botShipsDataList.length - 1;
  return botShipsDataList[randomNum(0, lastItemId)];
}

export class Bot {
  public readonly id = generateId();
}
