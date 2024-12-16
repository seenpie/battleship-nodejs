import { Player } from "@/features/player/player.entity";

const nameRegex = /^[A-Z][a-zA-Z0-9]*$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

export function validateNameSpelling(name: string) {
  if (!nameRegex.test(name)) {
    throw new Error(
      "name should be started in uppercase and not contain spaces and allow only latin"
    );
  }
}

export function validatePasswordSpelling(password: string) {
  if (!passwordRegex.test(password)) {
    throw new Error(
      "password should contain at least one digit and uppercase letter and not contain spaces"
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
