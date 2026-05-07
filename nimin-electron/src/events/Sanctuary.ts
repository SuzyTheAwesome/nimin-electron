// Ported from Events/Sanctuary.as
import { gs } from '../core/GameState.ts'
import { textL } from '../ui/TextRenderer.ts'
import { eventSelect } from '../screens/Exploration.ts'
import { doEnd } from '../core/GameEngine.ts'

export function doSanctuary(): void {
  eventSelect('Sanctuary')
  textL("There doesn't seem to be anything to find here yet.")
  gs.hrs = 1
  doEnd()
}
