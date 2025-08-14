export function calculateBotBid(currentCards: string[]): number {
  let score = 0;

  const trumpSuit = 'S'; // Spades are trump in Callbreak

  for (const card of currentCards) {
    const [suit, rankStr] = card.split('-');
    const rank = parseInt(rankStr, 10);

    // Card strength points (adjustable)
    let points = 0;
    if (rank === 13) points = 1.0;
    // Ace
    else if (rank === 12) points = 0.75;
    // King
    else if (rank === 11) points = 0.5;
    // Queen
    else if (rank === 10) points = 0.25; // Jack

    // Bonus for trump cards
    if (suit === trumpSuit) {
      points *= 1.3; // Make trumps more valuable
      if (rank >= 10) points += 0.2; // Extra bonus for high trump
    }

    score += points;
  }

  // Estimate tricks = score (round to nearest int)
  let bid = Math.round(score);

  // Clamp bid to minimum 1 and maximum 8
  if (bid < 1) bid = 1;
  if (bid > 8) bid = 8;

  return bid;
}
