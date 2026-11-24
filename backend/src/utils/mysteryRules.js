// Cost assumptions for margin calculation (shipping is charged separately)
exports.GATEWAY_PCT = 0.024;
exports.PACKING_COST = 9;
exports.CLAIMS_PCT = 0.045;

// Each prize must be worth at least price / productsCount,
// so the total value of a box is never below what the user paid.
exports.minPrizeValue = (level) => Math.ceil(level.price / level.productsCount);

exports.meetsValueRule = (level, product) => product.price >= exports.minPrizeValue(level);