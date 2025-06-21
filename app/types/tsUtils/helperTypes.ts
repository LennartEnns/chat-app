export type RequireNonNull<T, K extends keyof T> =
  Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type NonEmptyArray<T> = [T, ...T[]]
