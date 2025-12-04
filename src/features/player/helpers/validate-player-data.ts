import { Player } from "@/features/player/player.entity";

const nameRegex = /^[A-Z][a-zA-Z0-9]*$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

export function validateNameSpelling(name: string) {
  if (!nameRegex.test(name)) {
    throw new Error(
      "name should start with an uppercase letter and contain only Latin alphanumeric characters"
    );
  }
}

export function validatePasswordSpelling(password: string) {
  if (!passwordRegex.test(password)) {
    throw new Error(
      "password must contain at least one uppercase letter, one digit, and no spaces"
    );
  }
}

export function validateNameAvailability(name: string, players: Player[]) {
  players.forEach((player) => {
    if (player.name === name) {
      throw new Error("name already exists");
    }
  });
}
