const moment = require("moment");

module.exports = {
    relevantCropYears(date) {
        const givenDate = moment(date);
        const currentDate = moment();

        const cropYears = [];

        // Getting crop year from which date belongs to
        let givenYear = givenDate.year();

        if (givenDate.month() < 8) {
            givenYear--;
        }

        // Getting current crop year
        let year = moment().year();

        if (currentDate.month() < 8) {
            year--;
        }

        for (let index = givenYear; index <= year; index++) {
            cropYears.push(this.makeCropYear(index));
        }

        return this.cropYears = cropYears;
    },

    currentCropYear() {
        return this.getCropYear(moment());
    },

    getCropYear(date) {
        const givenDate = moment(date);
        let year = givenDate.year();

        if ( givenDate.month() < 8 ) {
            year--;
        }

        return this.makeCropYear(year);
    },

    makeCropYear (year) {
        return {
            cropYear: year.toString(),
            start: year + "-09-01T00:00:00.000Z",
            end: (+year + 1) + "-08-31T23:59:59.999Z",
        };
    },

    // genrates crop year conditional query
    cropYearQuery(cy) {

        let { cropYear, start, end } = this.makeCropYear(cy - 0);
        const ccy = this.currentCropYear();
        const nextCy = (cropYear - 0 + 1).toString();

        return {
            $cond: [
                { $and: [{ $gte: [ "$date", new Date(start) ] }, { $lte: [ "$date", new Date(end) ] }]},
                cropYear,
                (+ccy.cropYear > +nextCy ? this.cropYearQuery(nextCy) : nextCy )
            ]
        };
    }
};
