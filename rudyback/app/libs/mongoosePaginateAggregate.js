function aggregatePaginate (aggregate, options, callback) {
    options = options || {};
    let page = parseInt(options.page || 1, 10);
    let limit = parseInt(options.limit || 10, 10);
    let skipDocuments = (page - 1) * limit;
    let sortBy = options.sortBy;

    let q = this.aggregate(aggregate._pipeline);
    let countQuery = this.aggregate(q._pipeline);
    if (q.hasOwnProperty('options')) {
        q.options = aggregate.options;
        countQuery.options = aggregate.options;
    }

    if (sortBy) {
        q.sort(sortBy);
    }

    return Promise.all([q.skip(skipDocuments).limit(limit).exec(), countQuery.group({ _id: null, count: { $sum: 1 } }).exec()])
        .then(function (values) {
            let total = values[1][0] ? values[1][0].count : 0;
            if (typeof callback === 'function') {
                return callback(null, values[0], Math.ceil(total / limit) || 1, values[1][0] ? total : 0);
            }

            return Promise.resolve({
                docs: values[0],
                page,
                total,
                limit,
                pages: (Math.ceil(total / limit) || 1),
            });
        })
        .catch(function (reject) {
            if (typeof callback === 'function') {
                return callback(reject);
            }
            return Promise.reject(reject);
        });
}

module.exports = function (schema) {
    schema.statics.aggregatePaginate = aggregatePaginate;
};
