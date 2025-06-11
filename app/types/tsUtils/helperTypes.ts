export type RequireNonNull<T, K extends keyof T> =
  Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type NonEmptyArray<T> = [T, ...T[]]
