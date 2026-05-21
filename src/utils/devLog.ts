/** Production buildda console chiqmaydi — JS thread yengillashadi */
export function devLog(...args: unknown[]): void {
  if (__DEV__) {
    console.log(...args)
  }
}
