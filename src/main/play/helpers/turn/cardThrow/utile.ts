function getCardNumber(card: string): number {
  const number =
    Number(card.split('-')[1]) === 1 ? 14 : Number(card.split('-')[1]);
  return number;
}

const exportObject = {
  getCardNumber,
};

export = exportObject;
