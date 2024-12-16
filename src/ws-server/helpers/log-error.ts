export function logError(error: unknown) {
  if (error instanceof Error) {
    console.error("[ERROR]:", error.message);
    console.log(error);
  } else {
    console.error("[UNKNOWN ERROR]:", error);
  }
}
