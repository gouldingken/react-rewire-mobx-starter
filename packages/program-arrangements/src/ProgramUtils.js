/**
 * Creates a new instance of ProgramUtils.
 * @class
 * @returns An instance of ProgramUtils.
 * @example
 * var instance = new ProgramUtils();
 */
export default class ProgramUtils {

    static formatCost(cost) {
        if (cost > 0) {
            if (cost >= 1000000) {
                return '$ ' + (Math.round(cost / 100000) / 10) + 'M';
            } else if (cost >= 1000) {
                return '$ ' + (Math.round(cost / 100) / 10) + 'K';
            } else {
                return '$ ' + Math.round(cost).toLocaleString();
            }
        } else {
            return '$ -';
        }
    }

    static isMoved(store, move) {
        if (!store.inclusionList) return false;
        if (!move.moveIds) return false;
        return move.moveIds.some(function (moveId, i) {
            return store.inclusionList.indexOf(moveId) >= 0;
        });
    };

    static getMoveSum(store, prop, predicate) {
        predicate = predicate || ((move) => true);
        let sum = 0;
        store.moveSets.forEach((moveSet, i) => {
            moveSet.moves.forEach((move, i) => {
                if (ProgramUtils.isMoved(store, move)) {
                    if (predicate(move)) {
                        sum += move.properties[prop];
                    }
                }
            });
        });
        return sum;
    }

}
