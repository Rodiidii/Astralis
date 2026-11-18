/** Astralis bridge to the pinned Genshin Optimizer formula graph.
 * Upstream MIT license: genshin-optimizer-source/LICENSE.
 */
import { Calculator } from './genshin-optimizer-source/libs/gi/formula/src/calculator'
import { keys, values } from './genshin-optimizer-source/libs/gi/formula/src/data'
import { addCustomOperation, compileTagMapValues, constant } from './genshin-optimizer-source/libs/pando/engine/src'

addCustomOperation('res', {
  range: ([r]) => ({ min: resistance(r.max), max: resistance(r.min) }),
  monotonicity: () => [{ inc: false, dec: true }],
  calc: args => resistance(args[0] as number),
})
function resistance(value: number){return value<0?1-value/2:value<.75?1-value:1/(4*value+1)}

export function calculatorWithEntries(entries: any[]){
  return new Calculator(keys, values, compileTagMapValues(keys, entries))
}
export { constant }
export * from './genshin-optimizer-source/libs/gi/formula/src/meta'
export * from './genshin-optimizer-source/libs/gi/formula/src/util'
export * from './genshin-optimizer-source/libs/gi/formula/src/data/util'
export { allStats } from './genshin-optimizer-source/libs/gi/stats/src'
