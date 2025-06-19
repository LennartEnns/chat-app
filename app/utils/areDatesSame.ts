type CompareBy = 'day' | 'minute';

function sameDay(d1: Date, d2: Date) {
  return (d1.getDate() === d2.getDate() 
     && d1.getMonth() === d2.getMonth()
     && d1.getFullYear() === d2.getFullYear());
}

export default (by: CompareBy, d1: Date | null | undefined, d2: Date | null |undefined) => {
  if (!d1 || !d2) return false;
  switch(by) {
    case 'day':
      return sameDay(d1, d2);
    default:
      return (d1.getMinutes() === d2.getMinutes()
        && d1.getHours() === d2.getHours()
        && sameDay(d1, d2)
      );
  }
}
