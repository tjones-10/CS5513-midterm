// Return an inclusive random integer between the supplied bounds.
export function randomNumberBetween(min = 0, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Choose a random date 20–80 days before the provided start date.
export function getRandomDateBefore(startingDate = new Date()) {
  // Convert a random day offset into milliseconds and apply it to the start.
  const randomNumberOfDays = randomNumberBetween(20, 80);
  const randomDate = new Date(
    startingDate - randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  return randomDate;
}

// Choose a random date 1–19 days after the provided start date.
export function getRandomDateAfter(startingDate = new Date()) {
  // Convert the selected offset to milliseconds and add it to the start.
  const randomNumberOfDays = randomNumberBetween(1, 19);
  const randomDate = new Date(
    startingDate.getTime() + randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  return randomDate;
}
