export const pick = <T extends NonNullable<unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  return !keys || !keys.length
    ? obj
    : keys.reduce(
        (result, key) => {
          if (key in obj) {
            result[key] = obj[key];
          }
          return result;
        },
        {} as Pick<T, K>,
      );
};
