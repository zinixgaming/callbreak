function diffSeconds(date1: any, date2: any) {
  const diff = (new Date(date1).getTime() - new Date(date2).getTime()) / 1000;
  return Math.round(diff);
}

const exportObject = {
  diffSeconds,
};

export = exportObject;
