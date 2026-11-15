export function isValidBrazilianDocument(type: "CPF" | "CNPJ", value: string) {
  const digits = value.replace(/\D/g, "");
  const expectedLength = type === "CPF" ? 11 : 14;
  if (digits.length !== expectedLength || /^(\d)\1+$/.test(digits)) return false;

  if (type === "CPF") {
    const calculateDigit = (base: string, initialWeight: number) => {
      const sum = [...base].reduce(
        (total, digit, index) => total + Number(digit) * (initialWeight - index),
        0,
      );
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
      calculateDigit(digits.slice(0, 9), 10) === Number(digits[9]) &&
      calculateDigit(digits.slice(0, 10), 11) === Number(digits[10])
    );
  }

  const calculateDigit = (base: string, weights: number[]) => {
    if (base.length !== weights.length) throw new Error("Invalid document checksum configuration");
    const sum = weights.reduce(
      (total, weight, index) => total + (base.charCodeAt(index) - 48) * weight,
      0,
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, ...firstWeights];

  return (
    calculateDigit(digits.slice(0, 12), firstWeights) === Number(digits[12]) &&
    calculateDigit(digits.slice(0, 13), secondWeights) === Number(digits[13])
  );
}
