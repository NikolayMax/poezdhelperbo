interface IScheduleProps {
  callback: (count: number, stop: () => void) => void;
  interval: number;
  duration: number;
}
export const addSchedule = ({
  callback,
  interval,
  duration,
}: IScheduleProps) => {
  let count = 0;
  let idInterval: null | NodeJS.Timeout = null;
  const stop = () => {
    if (idInterval) {
      clearInterval(idInterval);
      idInterval = null;
    }
  };
  idInterval = setInterval(() => {
    callback(++count, stop);
  }, interval);

  setTimeout(stop, duration);
};
