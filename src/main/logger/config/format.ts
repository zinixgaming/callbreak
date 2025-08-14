import {format} from 'winston';

const {printf, timestamp, combine, align} = format;

const logFormat = printf(
  ({level, message, timestamp: ts}: any) => `${ts} :: ${level} :: ${message}`,
);

export = combine(timestamp(), align(), logFormat) as ReturnType<typeof combine>;
