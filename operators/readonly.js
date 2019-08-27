
/**
 * readonly
 *
 * @returns {{subscribe, pipe}}
 */
export function readonly() {
    return ({subscribe, pipe}) => ({ subscribe, pipe });
}
