/**
 * Inventory.ts
 * Ported from Inventory.as
 * Bag/stash management, item movement, shop interface.
 */

import { gs } from '../core/GameState.ts'
import { doEnd } from '../core/GameEngine.ts'
import { doProcess, doReturn } from '../core/GameEngine.ts'
import {
  bagSlotAdd, stashSlotAdd, itemName, itemAdd, itemRemove,
  gainItem, passiveItemAdd, passiveItemRemove, itemDescription,
  usableItem, conItem, foodItem, doItemUse, itemStackMax, canLose,
  loseManyItem
} from '../content/Items.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import {
  viewButtonText, viewButtonOutline, buttonWrite,
  hideAmount, choiceListButtons, choiceListSelect, choiceListBlanks,
  buttonConfirm
} from '../ui/ButtonManager.ts'
import { showMoveItem, statDisplay } from '../ui/UIManager.ts'

export { bagSlotAdd, stashSlotAdd }

export function doBag(): void {
  gs.inBag = true
  showMoveItem(true)

  choiceListButtons('Bag')
  choiceListBlanks()
  gs.doListen = function(): void {

    choiceListSelect('Bag')

    if (gs.buttonChoice === 12) {
      if (gs.moveItemID !== 0) {
        textL("Closing your bag while moving an item will discard the item.\r\rAre you sure you want to discard " + itemName(gs.moveItemID) + "")
        if (gs.moveItemStack > 1) { textLP(" x" + gs.moveItemStack) }
        textLP("?")
        buttonConfirm()
        gs.doListen = function(): void {
          if (gs.buttonChoice === 6) {
            passiveItemRemove(gs.moveItemID)
            gs.moveItemID = 0
            gs.moveItemStack = 0
            showMoveItem(false)
            gs.inBag = false
            doReturn()
          }
          else { doBag() }
        }
      }
      else {
        gs.inBag = false
        doReturn()
      }
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { doBag() }
    else {
      showMoveItem(false)
      useItem(gs.choiceListResult[0])
    }
  }
}

export function useItem(ID: number): void {
  if (ID === 0) {
    textL("This slot is empty.")
    doBag()
  }
  else {
    textL(itemDescription(ID))
    if (usableItem(ID) || conItem(ID)) {
      textLP("\r\rAre you sure you want to use this item?")
      if (conItem(ID)) { textLP("\r\rWarning: Using this item will consume it.") }
      buttonConfirm()
      gs.doListen = function(): void {
        if (gs.buttonChoice === 6) {
          if (conItem(ID)) {
            if (gs.bagStackArray[gs.choiceListResult[1]] <= 1) {
              bagSlotClear(gs.choiceListResult[1])
            }
            else {
              gs.bagStackArray[gs.choiceListResult[1]] -= 1
            }
          }
          // AS3 inherited bug fix: foodItem() in TS port returns the hunger
          // restoration amount but doesn't mutate gs.hunger (the AS3 version was
          // void and applied it directly). Apply the result here so eating food
          // actually fills the player. Mirrors AS3 `hunger += 2*tempNum;`.
          gs.hunger += 2 * foodItem(ID)
          doItemUse(ID)
          statDisplay()
        }
        else { doBag() }
      }
    }
    else { doBag() }
  }
}

/** doGainItem — process the item gain queue, handling stacking and full-bag overflow */
export function doGainItem(ID: number): void {
  let tempNum = 0
  const openSlot = checkOpenSlot(ID)

  if (openSlot >= 0) {
    if (gs.bagArray[openSlot] === 0) {
      gs.bagArray[openSlot] = ID
      gs.bagStackArray[openSlot] = 1
      passiveItemAdd(ID)
      tempNum++
      while (gs.bagStackArray[openSlot] < itemStackMax(ID) && gs.itemGainArray.indexOf(ID) !== -1) {
        gs.itemGainArray.pop()
        gs.bagStackArray[openSlot] += 1
        tempNum++
      }
    }
    else {
      tempNum++
      gs.bagStackArray[openSlot] += 1
      while (gs.bagStackArray[openSlot] < itemStackMax(ID) && gs.itemGainArray.indexOf(ID) !== -1) {
        gs.itemGainArray.pop()
        gs.bagStackArray[openSlot] += 1
        tempNum++
      }
    }
    if (tempNum < 2) { textL("You have obtained a " + itemName(ID) + "!") }
    else { textL("You have obtained " + tempNum + "x " + itemName(ID) + "!") }
    doEnd()
  }
  else {
    textL("You have obtained a " + itemName(ID) + "!\r\rHowever, you do not have enough room in your bag. Click on an item in your bag to replace it with the new one or click a non-item button to ignore the new item.")
    doDiscard(ID)
  }
}

/** bagSlotRemove — shrink bag by N slots, re-queuing lost items */
export function bagSlotRemove(amount: number): void {
  for (let i = 1; i <= amount; i++) {
    const tempInt = gs.bagArray.pop()
    const tempInt2 = gs.bagStackArray.pop()
    if (tempInt !== 0 && tempInt2 !== 0) {
      for (let j = 1; j <= tempInt2; j++) { itemAdd(tempInt) }
    }
  }
}

/** stashSlotRemove — shrink stash by N slots, re-queuing lost items */
export function stashSlotRemove(amount: number): void {
  for (let i = 1; i <= amount; i++) {
    const tempInt = gs.stashArray.pop()
    const tempInt2 = gs.stashStackArray.pop()
    if (tempInt !== 0 && tempInt2 !== 0) {
      for (let j = 1; j <= tempInt2; j++) { itemAdd(tempInt) }
    }
  }
}

/** doDiscard — bag-full: player chooses which slot to replace with new item */
export function doDiscard(ID: number): void {
  choiceListButtons('Bag')
  gs.doListen = function(): void {
    choiceListSelect('Bag')

    if (gs.buttonChoice === 12) {
      while (gs.itemGainArray.indexOf(ID) !== -1) { gs.itemGainArray.pop() }
      doProcess()
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Bag') }
    else if (canLose(gs.choiceListResult[0])) {
      textL(itemDescription(gs.choiceListResult[0]) + "\r\r" + itemDescription(ID) + "\r\rDo you want to replace " + itemName(gs.choiceListResult[0]) + " with " + itemName(ID) + "?")
      if (gs.bagStackArray[gs.choiceListResult[1]] > 1) { textLP("\r\rYou will lose all " + gs.bagStackArray[gs.choiceListResult[1]] + " of " + itemName(gs.choiceListResult[0]) + " if you do.") }
      buttonConfirm()
      gs.doListen = function(): void {
        if (gs.buttonChoice === 6) {
          bagSlotClear(gs.choiceListResult[1])
          doGainItem(ID)
        }
        if (gs.buttonChoice === 7) {
          doDiscard(ID)
        }
      }
    }
    else if (!canLose(gs.choiceListResult[0])) {
      textL("Something is preventing you from removing the " + itemName(gs.choiceListResult[0]) + ". You may have to unequip it first or it could be cursed!\r\rPlease choose something else.")
      doDiscard(ID)
    }
  }
}

/** itemMove — swap or stack items via shift-click in the bag UI */
export function itemMove(slot: number): void {
  const tempInt = gs.moveItemID
  const tempInt2 = gs.moveItemStack
  let tempI = slot + gs.choicePage * 9 - 9
  if (slot < 4) { tempI -= 1 }
  else if (slot < 8) { tempI -= 2 }
  else if (slot < 12) { tempI -= 3 }

  if (gs.moveItemID === gs.bagArray[tempI] && gs.bagStackArray[tempI] < itemStackMax(gs.bagArray[tempI])) {
    if (gs.moveItemStack + gs.bagStackArray[tempI] <= itemStackMax(gs.bagArray[tempI])) {
      gs.bagStackArray[tempI] += gs.moveItemStack
      gs.moveItemID = 0
      gs.moveItemStack = 0
    }
    else {
      gs.moveItemStack -= (itemStackMax(gs.bagArray[tempI]) - gs.bagStackArray[tempI])
      gs.bagStackArray[tempI] = itemStackMax(gs.bagArray[tempI])
    }
  }
  else {
    gs.moveItemID = gs.bagArray[tempI]
    gs.moveItemStack = gs.bagStackArray[tempI]
    gs.bagArray[tempI] = tempInt
    gs.bagStackArray[tempI] = tempInt2
  }

  if (gs.moveItemID === 0) {
    showMoveItem(false)
  }
  else {
    showMoveItem(true)
  }

  hideAmount()
  doBag()
}

/** checkOpenSlot — find first open or stackable slot for item id */
export function checkOpenSlot(id: number): number {
  let slot = -1
  for (let i = gs.bagArray.length - 1; i >= 0; i--) {
    if (gs.bagArray[i] === 0) { slot = i }
  }
  for (let i = gs.bagArray.length - 1; i >= 0; i--) {
    if (gs.bagStackArray[i] < itemStackMax(id) && gs.bagArray[i] === id) { slot = i }
  }
  return slot
}

/** bagSlotClear — remove item from bag slot */
export function bagSlotClear(slot: number): void {
  passiveItemRemove(gs.bagArray[slot])
  gs.bagArray[slot] = 0
  gs.bagStackArray[slot] = 0
}

/***********
 *Item Stash*
 ***********/

/** doStash — main stash menu with Store/Remove/Return */
export function doStash(): void {
  hideAmount()
  viewButtonOutline(0,0,0,1,0,0,0,1,0,0,0,1)
  viewButtonText(0,0,0,1,0,0,0,1,0,0,0,1)
  buttonWrite(4, "Store")
  buttonWrite(8, "Remove")
  buttonWrite(12, "Return")
  textL("Click 'Store' to store an item from your bag in the stash.\r\rClick 'Remove' to remove an item from your stash and put it into your bag.\r\rClick 'Return' to leave your stash.")
  gs.doListen = function(): void {
    if (gs.buttonChoice === 4) { doStoreStash() }
    if (gs.buttonChoice === 8) { doRemoveStash() }
    if (gs.buttonChoice === 12) {
      doReturn()
    }
  }
}

/** doStoreStash — pick a bag item to store in stash */
export function doStoreStash(): void {
  choiceListButtons('Bag')

  textL("Click on an item you would like to stash.\r\rClick 'Return' to return to the main stash options.")
  gs.doListen = function(): void {
    choiceListSelect('Bag')
    if (gs.buttonChoice === 12) {
      doStash()
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Bag') }
    else {
      if (canLose(gs.bagArray[gs.choiceListResult[1]])) { stashStore(gs.choiceListResult[1]) }
      else {
        doStoreStash()
        textL("You cannot remove the selected item from your bag for some reason. It may be cursed or need to be unequipped first.\r\rPlease select another item.")
      }
    }
  }
}

/** doRemoveStash — pick a stash item to move to bag */
export function doRemoveStash(): void {
  choiceListButtons('Stash')
  textL("Click on an item you would like to remove from stash.\r\rClick 'Return' to return to the main stash options.")
  gs.doListen = function(): void {
    choiceListSelect('Stash')
    if (gs.buttonChoice === 12) {
      doStash()
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) { choiceListButtons('Stash') }
    else {
      stashRemove(gs.choiceListResult[1])
    }
  }
}

/** stashStore — place a bag item into a stash slot (with swap/stack) */
export function stashStore(storeItem: number): void {
  choiceListButtons('Stash')
  choiceListBlanks()
  textL("Click on the stash slot you would like to place " + itemName(gs.bagArray[storeItem]) + " in. If you click on a slot that is already used, you will swap the items.\r\rClick 'Return' to return to the main stash options.")
  gs.doListen = function(): void {
    choiceListSelect('Stash')
    if (gs.buttonChoice === 12) {
      doStash()
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) {
      choiceListButtons('Stash')
      choiceListBlanks()
    }
    else {
      const tempNum = gs.bagArray[storeItem]
      const tempNum2 = gs.bagStackArray[storeItem]

      if (tempNum === gs.stashArray[gs.choiceListResult[1]] && gs.stashStackArray[gs.choiceListResult[1]] < itemStackMax(tempNum)) {
        if ((gs.stashStackArray[gs.choiceListResult[1]] + tempNum2) > itemStackMax(tempNum)) {
          gs.bagStackArray[storeItem] -= itemStackMax(tempNum) - gs.stashStackArray[gs.choiceListResult[1]]
          gs.stashStackArray[gs.choiceListResult[1]] = itemStackMax(tempNum)
        }
        else {
          gs.stashStackArray[gs.choiceListResult[1]] += tempNum2
          bagSlotClear(storeItem)
        }
      }
      else {
        bagSlotClear(storeItem)
        gs.bagArray[storeItem] = gs.choiceListResult[0]
        gs.bagStackArray[storeItem] = gs.stashStackArray[gs.choiceListResult[1]]

        gs.stashArray[gs.choiceListResult[1]] = tempNum
        gs.stashStackArray[gs.choiceListResult[1]] = tempNum2
      }

      doStoreStash()
    }
  }
}

/** stashRemove — take a stash item and place it into a bag slot (with swap/stack) */
export function stashRemove(storeItem: number): void {
  choiceListButtons('Bag')
  choiceListBlanks()
  textL("Click on the bag slot you would like to place " + itemName(gs.stashArray[storeItem]) + " in. If you click on a slot that is already used, you will swap the items.\r\rClick 'Return' to return to the main stash options.")
  gs.doListen = function(): void {
    choiceListSelect('Bag')
    if (gs.buttonChoice === 12) {
      doStash()
    }
    else if (gs.buttonChoice === 4 || gs.buttonChoice === 8) {
      choiceListButtons('Bag')
      choiceListBlanks()
    }
    else {
      if (canLose(gs.choiceListResult[0])) {
        const tempNum = gs.stashArray[storeItem]
        const tempNum2 = gs.stashStackArray[storeItem]

        if (tempNum === gs.bagArray[gs.choiceListResult[1]] && gs.bagStackArray[gs.choiceListResult[1]] < itemStackMax(tempNum)) {
          if ((gs.bagStackArray[gs.choiceListResult[1]] + tempNum2) > itemStackMax(tempNum)) {
            gs.stashStackArray[storeItem] -= itemStackMax(tempNum) - gs.bagStackArray[gs.choiceListResult[1]]
            gs.bagStackArray[gs.choiceListResult[1]] = itemStackMax(tempNum)
          }
          else {
            gs.bagStackArray[gs.choiceListResult[1]] += tempNum2
            gs.stashArray[storeItem] = 0
            gs.stashStackArray[storeItem] = 0
          }
        }
        else {
          gs.stashArray[storeItem] = gs.choiceListResult[0]
          gs.stashStackArray[storeItem] = gs.bagStackArray[gs.choiceListResult[1]]

          bagSlotClear(gs.choiceListResult[1])
          gs.bagArray[gs.choiceListResult[1]] = tempNum
          gs.bagStackArray[gs.choiceListResult[1]] = tempNum2
          passiveItemAdd(tempNum)
        }
        doRemoveStash()
      }
      else {
        stashRemove(storeItem)
        textL("You cannot remove that item from your bag. It may be cursed or needs to be unequipped first.\r\rPlease select another slot to move your stashed item into.")
      }
    }
  }
}
