export type RequireNonNull<T, K extends keyof T> =
  Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export type NonEmptyArray<T> = [T, ...T[]]
