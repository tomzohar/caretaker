function Time(amount: number) {
  const SECOND = 1000;

  return {
    seconds: (): number => amount * SECOND,
    minutes: (): number => amount * Time(60).seconds(),
    hours: (): number => amount * Time(60).minutes(),
    days: (): number => amount * Time(24).hours(),
    weeks: (): number => amount * Time(7).days(),
  };
}

export default Time;
