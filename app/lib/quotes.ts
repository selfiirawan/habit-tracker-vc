export const quotes = [
  "Small steps every day beat occasional bursts.",
  "Consistency is a skill you can train.",
  "Show up today; tomorrow will thank you.",
  "A habit is a vote for the person you want to become.",
  "Progress loves momentum."
];

export function getDailyQuote(seed: number) {
  return quotes[seed % quotes.length];
}
