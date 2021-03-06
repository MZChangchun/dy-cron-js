import numeral from 'numeral';

const randomInt = function(minimum: number, maximum: number) {
    return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);
};

export default {
    cronParser(cronExpression?: string) {
        console.log('cron: ', cronExpression);
        if (!cronExpression) {
            return undefined;
        }
        const arr = cronExpression.split(' ');
        if (arr.length != 6) {
            throw new Error(`${cronExpression} 不是有效的 cron 表达式`);
        }

        const second = arr[0];
        const minute = arr[1];
        const hour = arr[2];
        const dayOfMonth = arr[3];
        const month = arr[4];
        const dayOfWeek = arr[5];

        const minutes = Number.parseInt(minute);

        if (hour.indexOf('-') === 2 && hour.indexOf('/') === 5) {
            const intervalHours = Number.parseInt(hour.substr(6, 2));
            const startHours = Number.parseInt(hour.substr(0, 2));
            const endHours = Number.parseInt(hour.substr(3, 2));

            return {
                cycle: 'H',
                intervalHours,
                startHours,
                startMinutes: minutes,
                endHours,
            };
        } else {
            const hours = Number.parseInt(hour);

            if (dayOfWeek === '?') {
                // 日
                if (dayOfMonth === '*') {
                    return { cycle: 'D', hours, minutes };
                } else if (month.indexOf(',') > 0) {
                    return {
                        cycle: 'Q',
                        month,
                        dayOfMonth: Number.parseInt(dayOfMonth),
                        hours,
                        minutes,
                    };
                } else {
                    // 月
                    return {
                        cycle: 'M',
                        dayOfMonth: Number.parseInt(dayOfMonth),
                        hours,
                        minutes,
                    };
                }
            } else {
                // 周
                return { cycle: 'W', dayOfWeek, hours, minutes };
            }
        }
    },
    generateCron(value: {
        cycle: string;
        intervalHours?: number;
        startHours?: number;
        startMinutes?: number;
        endHours?: number;
        hours?: number;
        minutes?: number;
        dayOfWeek?: string;
        dayOfMonth?: number;
        month?: string;
    }) {
        const { cycle } = value;
        if (cycle === 'H') {
            const { intervalHours, startHours, startMinutes, endHours } = value;
            if (
                intervalHours != undefined &&
                startHours != undefined &&
                startMinutes != undefined &&
                endHours != undefined
            ) {
                return `00 ${numeral(startMinutes).format('00')} ${numeral(
                    startHours,
                ).format('00')}-${numeral(endHours).format('00')}/${numeral(
                    intervalHours,
                ).format('00')} * * ?`;
            } else {
                throw new Error('错误的参数');
            }
        } else {
            const { hours, minutes } = value;
            if (hours != undefined && minutes != undefined) {
                if (cycle === 'D') {
                    return `00 ${numeral(minutes).format('00')} ${numeral(
                        hours,
                    ).format('00')} * * ?`;
                } else if (cycle === 'W') {
                    const { dayOfWeek } = value;
                    return `00 ${numeral(minutes).format('00')} ${numeral(
                        hours,
                    ).format('00')} ? * ${dayOfWeek}`;
                } else if (cycle === 'M') {
                    const { dayOfMonth } = value;
                    return `00 ${numeral(minutes).format('00')} ${numeral(
                        hours,
                    ).format('00')} ${dayOfMonth} * ?`;
                } else if (cycle === 'Q') {
                    const { dayOfMonth, month } = value;
                    return `00 ${numeral(minutes).format('00')} ${numeral(
                        hours,
                    ).format('00')} ${dayOfMonth} ${month} ?`;
                } else {
                    throw new Error('无效的周期');
                }
            } else {
                throw new Error('错误的参数');
            }
        }
    },
    generateRandomCron(cycle: string) {
        if (cycle === 'H') {
            return `00 ${numeral(randomInt(0, 59)).format('00')} ${numeral(
                randomInt(8, 23),
            ).format('00')}-00/${numeral(randomInt(1, 23)).format('00')} * * ?`;
        } else if (cycle === 'D') {
            return `00 ${numeral(randomInt(0, 59)).format('00')} ${numeral(
                randomInt(0, 23),
            ).format('00')} * * ?`;
        } else if (cycle === 'W') {
            return `00 ${numeral(randomInt(0, 59)).format('00')} ${numeral(
                randomInt(0, 23),
            ).format('00')} ? * MON`;
        } else if (cycle === 'M') {
            return `00 ${numeral(randomInt(0, 59)).format('00')} ${numeral(
                randomInt(0, 23),
            ).format('00')} ${numeral(randomInt(1, 31)).format('00')} * ?`;
        } else if (cycle === 'Q') {
            return `00 ${numeral(randomInt(0, 59)).format('00')} ${numeral(
                randomInt(0, 23),
            ).format('00')} ${numeral(randomInt(1, 31)).format(
                '00',
            )} 3,6,9,12 ?`;
        }
        throw new Error('无效的周期');
    },
};
