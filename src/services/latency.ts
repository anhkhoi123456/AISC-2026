export const delay = (ms = 180) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
