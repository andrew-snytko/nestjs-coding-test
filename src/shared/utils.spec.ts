import { getMonthDiff } from './utils';

describe('shared/utils', () => {
    describe('getMonthDiff', () => {
        it('should return diff in month between two dates', () => {
            expect(
                getMonthDiff(
                    new Date('2020-01-13T17:21:08.590Z'),
                    new Date('2020-01-13T17:21:08.590Z'),
                ),
            ).toEqual(0);

            expect(
                getMonthDiff(
                    new Date('2020-01-13T17:21:08.590Z'),
                    new Date('2020-05-13T17:21:08.590Z'),
                ),
            ).toEqual(4);

            expect(
                getMonthDiff(
                    new Date('2019-01-13T17:21:08.590Z'),
                    new Date('2020-01-13T17:21:08.590Z'),
                ),
            ).toEqual(12);

            expect(
                getMonthDiff(
                    new Date('2019-01-13T17:21:08.590Z'),
                    new Date('2020-07-13T17:21:08.590Z'),
                ),
            ).toEqual(18);
        });
    });
});
