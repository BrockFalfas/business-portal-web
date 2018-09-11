export const phoneFormatter = value =>
  value &&
  value.toString().replace(/^(\d{3})(\d{1,3})(\d{0,})$/, (all, g1, g2, g3) => {
    if (g3) {
      return `${g1} ${g2}-${g3}`;
    }
    if (g2) {
      return `${g1} ${g2}`;
    }
    return `${g1}`;
  });
