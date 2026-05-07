// Ported from Battling.as
import { gs } from '../core/GameState.ts';
import { bc } from '../core/GameState.ts';
import { textL, textLP } from '../ui/TextRenderer.ts';
import { viewButtonOutline, viewButtonText, buttonWrite, showPage, setButtonVisible } from '../ui/ButtonManager.ts';
import { percent } from '../core/GameUtilities.ts';
import { doLust, doHP, doSexP, doCoin } from './StatChanges.ts';
import { itemAdd, itemName } from '../content/Items.ts';
import {
  vulvaDesc, legDesc, cockDesc, nipDesc,
  tailDesc, buttDesc, hipDesc, boobDesc, ballDesc, plural, regionName
} from '../content/Descriptions.ts';
import { clothesBottom as clothesBottomCl, clothesTop as clothesTopCl, pullUD } from '../content/Clothes.ts';
import { moistCalc } from '../core/Calculations.ts';
import { regionChange } from '../screens/EventUtilities.ts';
// Direct import (cycle is fine — both modules use these only inside functions)
import { enemyAttackImpl } from '../content/Enemies.ts';

// Late-binding callbacks for functions that would create circular deps
let _doBag:         (() => void)        | null = null
let _doNext:        (() => void)        | null = null
let _doEnd:         (() => void)        | null = null
let _doReturn:      (() => void)        | null = null
let _doGetRaped:    (() => void)        | null = null
let _doRape:        (() => void)        | null = null
let _specialKOWin:  (() => void)        | null = null
let _specialRapeWin:(() => void)        | null = null
let _doProcess:     (() => void)        | null = null

export function setBattleCallbacks(cbs: {
  doBag?:          () => void
  doNext?:         () => void
  doEnd?:          () => void
  doReturn?:       () => void
  doGetRaped?:     () => void
  doRape?:         () => void
  specialKOWin?:   () => void
  specialRapeWin?: () => void
  doProcess?:      () => void
}): void {
  if (cbs.doBag)          _doBag = cbs.doBag
  if (cbs.doNext)         _doNext = cbs.doNext
  if (cbs.doEnd)          _doEnd = cbs.doEnd
  if (cbs.doReturn)       _doReturn = cbs.doReturn
  if (cbs.doGetRaped)     _doGetRaped = cbs.doGetRaped
  if (cbs.doRape)         _doRape = cbs.doRape
  if (cbs.specialKOWin)   _specialKOWin = cbs.specialKOWin
  if (cbs.specialRapeWin) _specialRapeWin = cbs.specialRapeWin
  if (cbs.doProcess)      _doProcess = cbs.doProcess
}

export function enemyName(): string {
  return (gs as any).enemyName ?? 'enemy';
}

export function setEnemyStats(
  enemyHP: number, enemyStr: number, enemyMenta: number, enemySen: number,
  enemyLib: number, enemyLust: number, enemyGen: number, enemyPref: number,
  enemyCoin: number, enemySexP: number, enemyItem: number
): void {
  gs.eHP    = enemyHP;
  gs.eStr   = enemyStr;
  gs.eMenta = enemyMenta;
  gs.eSen   = enemySen;
  gs.eLib   = enemyLib;
  gs.eLust  = enemyLust;
  gs.eGen   = enemyGen;
  gs.ePref  = enemyPref;
  gs.eCoin  = enemyCoin;
  gs.eSexP  = enemySexP;
  gs.eItem  = enemyItem;
}

export function doBattle(): void {
  bc();
  viewButtonOutline(1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1);
  viewButtonText(1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1);
  buttonWrite(1, 'Bag');
  buttonWrite(2, 'Run');
  buttonWrite(5, 'Attack');
  buttonWrite(7, 'Special');
  buttonWrite(9, 'Rape');
  buttonWrite(10, 'Entice');
  buttonWrite(12, 'Submit');
  // AS3 inherited bug fix: AS3 said `if (lust < 15) Choice12.visible = false;`
  // — only hides Submit when not aroused enough. The TS port translated that as
  // viewButtonOutline(0,...,0) which hid ALL 12 buttons, leaving the player
  // stuck staring at text with no actions any time their lust dipped below 15
  // (e.g. after a successful humiliation rape that drained lust).
  if (gs.lust < 15) { setButtonVisible(12, false); }

  gs.doListen = (): void => {
    if (gs.buttonChoice === 1) {
      if (_doBag) _doBag();
    }
    if (gs.buttonChoice === 2) {
      if (percent() <= (20 + gs.runMod)) {
        textL('You successfully run away!');
        if (gs.inDungeon === true) {
          regionChange(gs.currentZone);
          gs.inDungeon = false;
          textLP('\r\rTo escape, you run all the way back to ' + regionName(gs.currentZone) + '.');
        }
        gs.currentState = 1;
        gs.hrs = 1;
        if (_doEnd) _doEnd();
      } else {
        textL('You fail to run away...');
        if (gs.currentState === 2) { enemyAttack(); }
        if (gs.currentState === 2) { doBattle(); }
      }
    }
    if (gs.buttonChoice === 5) {
      weaponAttack();
      if (gs.currentState === 2) { enemyAttack(); }
      if (gs.currentState === 2) { doBattle(); }
    }
    if (gs.buttonChoice === 7) { doSpecialAbility(1); }
    if (gs.buttonChoice === 9) {
      if (gs.gender === 0 || gs.eGen === 0) {
        textL('What are you going to rape it with? Good intentions?\r\rChoose another option.');
        if (gs.currentState === 2) { doBattle(); }
      } else {
        textL('You attempt to toss the ' + enemyName() + ' to the ground and fuck it wildly!');
        if (gs.lust < 15) {
          textLP('\r\rHowever, you aren\'t nearly aroused enough to even think about penetration, leaving your efforts futile.');
          if (gs.currentState === 2) { enemyAttack(); }
        } else if ((percent() / 5 + gs.str + gs.rapeMod) <= (percent() / 5 + gs.eStr - gs.eLust / 2)) {
          textLP('\r\rHowever, the ' + enemyName() + ' overpowers you and tosses you off!');
          if (gs.currentState === 2) { enemyAttack(); }
        } else if (((gs.ePref !== gs.gender && gs.ePref !== 4) && gs.gender !== 3) || gs.ePref === 0) {
          const dmg = Math.floor(percent() / 10 + gs.lust / 10);
          textLP('\r\rHowever, the ' + enemyName() + ' is sorely turned off by your rough pounding on its sensitive area, merely hurting its genitals and its pride.\r\rBut you do deal ' + dmg + ' damage and satisfy yourself a bit.');
          doeHP(-dmg);
          doLust(-Math.floor(percent() / 20 + gs.sen / 10), 2, 1, 2);
        } else {
          if (_doRape) _doRape();
          const eLustChange = Math.floor(percent() / 10 + gs.eSen / 5);
          if ((gs.eLust - eLustChange) <= 0) { gs.eLust = 0; }
          if ((gs.eMenta - eLustChange) < 0) {
            if (_specialRapeWin) _specialRapeWin();
            textLP('\r\rYou win!');
            gs.currentState = 1;
            if (_doNext) _doNext();
            gs.doListen = (): void => { battleWin(); };
          } else {
            textLP('\r\rThe ' + enemyName() + ' picks itself up after you had your way with it, a little distraught but not yet defeated.');
            gs.eLust -= eLustChange;
          }
          gs.eMenta -= eLustChange;
        }
        if (gs.currentState === 2) { doBattle(); }
      }
    }
    if (gs.buttonChoice === 10) {
      doEntice();
      if (gs.currentState === 2) { enemyAttack(); }
      if (gs.currentState === 2) { doBattle(); }
    }
    if (gs.buttonChoice === 12) {
      textL('No longer wishing to fight, you attempt to submit yourself to the ' + enemyName() + '\'s whims in hopes of leaving the battle with a little fun.');
      if (gs.ePref === 0 || (gs.ePref === 1 && gs.gender === 2) || (gs.ePref === 2 && gs.gender === 1) || gs.gender === 0) {
        textLP('\r\rHowever, it is quickly apparent that the enemy has no interest in you, in that fashion.');
        if (gs.currentState === 2) { enemyAttack(); }
      } else if (gs.eLust < gs.eMenta) {
        textLP('\r\rHowever, the ' + enemyName() + ' isn\'t nearly aroused enough, a bit too cautious at the moment to assault you in such a way.');
        if (gs.currentState === 2) { enemyAttack(); }
      } else {
        gs.currentState = 1;
        if (_doNext) _doNext();
        gs.doListen = (): void => { if (_doGetRaped) _doGetRaped(); };
      }
      if (gs.currentState === 2) { doBattle(); }
    }
  };
}

export function weaponAttack(): void {
  let dmg = 0;
  if (gs.weapon === 10) {
    dmg = Math.floor(Math.random() * (1 + 10 - 1)) + 1 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You punch the ' + enemyName() + ' with your fists, dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 116) {
    dmg = Math.floor(Math.random() * (1 + 12 - 5)) + 5 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You lunge at the ' + enemyName() + ' and stab it with your dagger, dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 117) {
    dmg = Math.floor(Math.random() * (1 + 20 - 2)) + 2 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You swing your hammer at the ' + enemyName() + ', dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 118) {
    dmg = Math.floor(Math.random() * (1 + 25 - 10)) + 10 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You slash at the ' + enemyName() + ' with your saber, dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 119) {
    dmg = Math.floor(Math.random() * (1 + 18 - 12)) + 12 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You lash at the ' + enemyName() + ' with your whip, dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 127) {
    dmg = Math.floor(Math.random() * (1 + 20 - 10)) + 10 + Math.floor(gs.str / 2 - ((100 - gs.eSen) / 20));
    textL('You whip around your tail and smack the ' + enemyName() + ' with the spike at the end, dealing ' + dmg + ' damage!');
    doeHP(-dmg);
  }
  if (gs.weapon === 235) {
    dmg = Math.floor(Math.random() * (1 + 5 - 1)) + 1 + Math.ceil(gs.ment / 10);
    if (gs.ment < 30)      { textL('You awkwardly stuff the wide-rimmed head of the rod into your mouth, sucking as hard as you can even though you only manage drain ' + dmg + ' HP from the ' + enemyName() + '.'); }
    else if (gs.ment < 70) { textL('You gently lick around the wide-rimmed head of the rod before sliding it into your mouth and gently sucking from the tip, draining a whole ' + dmg + ' HP from the ' + enemyName() + '.'); }
    else                   { textL('You lick up the shaft of the rod before swirling your tongue around the wide-rimmed head, coaxing it into your mouth as you continue to drag your tastebuds over and around it while pumping it in and out gently, draining ' + dmg + ' HP from the ' + enemyName() + '!'); }
    doeHP(-dmg);
    doHP(dmg);
  }
}

export function doSpecialAbility(more: number): void {
  viewButtonOutline(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
  viewButtonText(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
  gs.choicePage = more;
  showPage(true, 'Spc Abilities');
  buttonWrite(4, '<<');
  buttonWrite(8, '>>');
  buttonWrite(12, 'Return');

  const specialAbilityArray: number[] = [];
  if (gs.skunkAffinity >= 40) { specialAbilityArray.push(1); }

  if (specialAbilityArray.length < 1) { textL('Your do not currently have any special abilities that you can use.'); }
  else { textL('Which special ability would you like to use?'); }

  const offset = (more - 1) * 9;
  const slots = [1, 2, 3, 5, 6, 7, 9, 10, 11];
  const abSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (specialAbilityArray.length > 9) {
    viewButtonOutline(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
    viewButtonText(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
  }
  for (let s = 0; s < 9; s++) {
    const abilID = specialAbilityArray[offset + s];
    if (abilID !== undefined) {
      buttonWrite(slots[s], specialAbilityName(abilID));
      specialAbilityDescription(abilID);
      setButtonVisible(slots[s], true);
    }
  }

  gs.doListen = (): void => {
    for (let s = 0; s < 9; s++) {
      if (gs.buttonChoice === slots[s] && specialAbilityArray[offset + s] !== undefined) {
        specialAbilityUse(specialAbilityArray[offset + s]);
      }
    }
    if (gs.buttonChoice === 4) {
      if (specialAbilityArray.length / 9 < more) { doSpecialAbility(1); }
      else { doSpecialAbility(more + 1); }
    }
    if (gs.buttonChoice === 8) {
      if (more === 1) { doSpecialAbility(Math.floor(specialAbilityArray.length / 9)); }
      else { doSpecialAbility(more - 1); }
    }
    if (gs.buttonChoice === 12) {
      showPage(false, '');
      if (_doReturn) _doReturn();
    }
  };
}

function specialAbilityName(ID: number): string {
  if (ID === 1) { return 'Skunk Spray'; }
  return 'SPECIAL ABILITY NAME ERROR ' + ID;
}

function specialAbilityDescription(ID: number): string {
  if (ID === 1) { return '\r\rSkunk Spray - Using your scent glands in your rump, you can unleash this terrible stench upon your enemy, causing damage and potentially making them miss their next turn.'; }
  return 'SPECIAL ABILITY DESC ERROR ' + ID;
}

function specialAbilityUse(ID: number): void {
  let dmg = 0;
  if (ID === 1) {
    dmg = Math.floor(10 + percent() / 10);
    textLP('\r\rYou turn around and aim your ' + buttDesc() + ' butt at the ' + enemyName() + ' and spray out a foul odor. The ' + enemyName() + ' snorts and shakes, taking ' + dmg + ' damage.');
    doeHP(-dmg);
    if (percent() < 35 && gs.currentState === 2) { textLP('\r\rThe ' + enemyName() + ' flinches so badly from the stench that it misses its chance to counter.'); }
    else if (gs.currentState === 2) { enemyAttack(); }
  }
  if (gs.currentState === 2) { doBattle(); }
}

export function doEntice(): void {
  const chance = percent();
  if (gs.eGen === 1 && gs.gender === 1 && gs.ePref !== 2 && gs.ePref !== 0) {
    if (chance <= 50) {
      textL('You turn around and bend over before the ' + enemyName() + ' stroking the ' + cockDesc() + ' bulge in your ' + clothesBottomCl() + ' and patting your ' + buttDesc() + ' rump while you wave your ' + hipDesc() + ' hips');
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail dancing above'); }
      textLP(' tantalizingly.');
    }
    if (chance > 50) {
      textL('You flex your muscles, trying to show off your masculinity, while you thrust your ' + hipDesc() + ' hips in an attempt to show off your ' + cockDesc() + ' bulge.');
    }
    if (gs.ePref === 1 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5 + gs.enticeMod / 2)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10 + gs.enticeMod / 2)); }
  } else if (gs.eGen === 1 && gs.gender === 2 && gs.ePref !== 1 && gs.ePref !== 0) {
    if (chance <= 50) {
      textL('You turn around and bend over before the ' + enemyName() + ', stroking your ' + vulvaDesc() + ' vulva through your ' + clothesBottomCl());
      if (gs.lust > 20 && moistCalc(2) > 3) { textLP(' until your feminine arousal seeps through'); }
      textLP('. Your ' + hipDesc() + ' hips wiggle erotically');
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail dancing above'); }
      textLP('.');
    }
    if (chance > 50) {
      textL('You lick your finger before sliding it into your mouth, sucking and pulling it out slowly with a small drop of saliva dangling upon your supple lips while you rub a ' + nipDesc() + 'nipple through your ' + clothesTopCl() + ' with your other hand.');
    }
    if (gs.ePref === 2 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5 + gs.enticeMod / 2)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10 + gs.enticeMod / 2)); }
  } else if (gs.eGen === 2 && gs.gender === 1 && gs.ePref !== 2 && gs.ePref !== 0) {
    if (chance <= 50) {
      textL('You pull ' + pullUD(2) + ' your ' + clothesBottomCl() + ' a little, revealing the base of your cock-flesh');
      if (gs.lust > 20) { textLP(', the ' + cockDesc() + ' erection pulsing strongly beneath your ' + clothesBottomCl()); }
      textLP(', rubbing it to show off what you can offer');
      if (moistCalc(1) > 3) { textLP(', a blotch of pre beginning to seep across the fabric'); }
      textLP('.');
    }
    if (chance > 50) { textL('You flex your muscles as you groan with sexual desire, trying to turn you opponent on with the possibilities of what might come.'); }
    if (gs.ePref === 1 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5 + gs.enticeMod / 2)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10 + gs.enticeMod / 2)); }
  } else if (gs.eGen === 2 && gs.gender === 2 && gs.ePref !== 1 && gs.ePref !== 0) {
    if (chance <= 50) {
      textL('You spread your ' + legDesc(6) + ', crouching down as both hands grind into your ' + vulvaDesc() + ' pussy');
      if (gs.lust > 20 && moistCalc(2) > 3) { textLP(', your honey spreading from the crotch of your ' + clothesBottomCl() + ','); }
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail swishing across the ground,'); }
      textLP(' luring the ' + enemyName() + ' to come grind instead.');
    }
    if (chance > 50) {
      textL('Your arms hug beneath your ' + boobDesc() + ' chest, squeezing the mounds and making them look even bigger');
      if ((gs.lust > 20 && gs.nippleSize > 1) || gs.nippleSize > 6) { textLP(', your ' + nipDesc() + 'nipples clearly visible through your ' + clothesTopCl()); }
      textLP('.');
    }
    if (gs.ePref === 2 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5 + gs.enticeMod / 2)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10 + gs.enticeMod / 2)); }
  } else if (gs.eGen === 3 && gs.gender === 1 && gs.ePref !== 2 && gs.ePref !== 0) {
    if (chance <= 25) {
      textL('You turn around and bend over before the ' + enemyName() + ' stroking the ' + cockDesc() + ' bulge in your ' + clothesBottomCl() + ' and patting your ' + buttDesc() + ' rump while you wave your ' + hipDesc() + ' hips');
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail dancing above'); }
      textLP(' tantalizingly.');
    }
    if (chance > 25 && chance <= 50) { textL('You flex your muscles, trying to show off your masculinity, while you thrust your ' + hipDesc() + ' hips in an attempt to show off your ' + cockDesc() + ' bulge.'); }
    if (chance > 50 && chance <= 75) {
      textL('You pull ' + pullUD(2) + ' your ' + clothesBottomCl() + ' a little, revealing the base of your cock-flesh');
      if (gs.lust > 20) { textLP(', the ' + cockDesc() + ' erection pulsing strongly beneath your ' + clothesBottomCl()); }
      textLP(', rubbing it to show off what you can offer');
      if (moistCalc(1) > 3) { textLP(', a blotch of pre begining to seep across the fabric'); }
      textLP('.');
    }
    if (chance > 75) { textL('You flex your muscles as you groan with sexual desire, trying to turn you opponent on with the possibilities of what might come.'); }
    if (gs.ePref === 1 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5 + gs.enticeMod / 2)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10 + gs.enticeMod / 2)); }
  } else if (gs.eGen === 3 && gs.gender === 2 && gs.ePref !== 1 && gs.ePref !== 0) {
    if (chance <= 25) {
      textL('You spread your ' + legDesc(6) + ', crouching down as both hands grinding into your ' + vulvaDesc() + ' pussy');
      if (gs.lust > 20 && moistCalc(2) > 3) { textLP(', your honey spreading from the crotch of your ' + clothesBottomCl() + ','); }
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail swishing across the ground,'); }
      textLP(' luring the ' + enemyName() + ' to come grind instead.');
    }
    if (chance > 25 && chance <= 50) {
      textL('Your arms hug beneath your ' + boobDesc() + ' chest, squeezing the mounds and making them look even bigger');
      if ((gs.lust > 20 && gs.nippleSize > 1) || gs.nippleSize > 6) { textLP(', your ' + nipDesc() + 'nipples clearly visible through your ' + clothesTopCl() + '.'); }
      textLP('.');
    }
    if (chance > 50 && chance <= 75) {
      textL('You turn around and bend over before the ' + enemyName() + ', stroking your ' + vulvaDesc() + ' vulva through your ' + clothesBottomCl());
      if (gs.lust > 20 && moistCalc(2) > 3) { textLP(' until your feminine arousal seeps through'); }
      textLP('. Your ' + hipDesc() + ' hips waggle erotically');
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail dancing above'); }
      textLP('.');
    }
    if (chance > 75) { textL('You lick your finger before sliding it into your mouth, sucking and pulling it out slowly with a small drop of saliva dangling upon your supple lips while you rub a ' + nipDesc() + 'nipple through your ' + clothesTopCl() + ' with your other hand.'); }
    if (gs.ePref === 2 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5)); }
    else if (gs.ePref === 3) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10)); }
  } else if (gs.gender === 3 && gs.ePref !== 0 && gs.eGen !== 0) {
    if (chance <= 25) {
      textL('You turn around and bend over before the ' + enemyName() + ', patting your ' + buttDesc() + ' ass and ' + vulvaDesc() + ' pussy. You waggle your ' + hipDesc() + ' hips, the ' + cockDesc() + ' bulge in your ' + clothesBottomCl() + ' swaying');
      if (gs.tail !== 0) { textLP(', your ' + tailDesc() + ' tail dancing above'); }
      textLP(' deliciously.');
    }
    if (chance > 25 && chance <= 50) { textL('Your arms hug beneath your ' + boobDesc() + ' chest, squeezing the mounds and making them look even bigger while you flex, thrusting at the air with your ' + cockDesc() + ' package bobbing.'); }
    if (chance > 50 && chance <= 75) {
      textL('You pull ' + pullUD(2) + ' your ' + clothesBottomCl() + ' a little, revealing the base of your male anatomy while you spread your ' + legDesc(6) + ', crouching down as both hands grind across the bulge and into your female portions');
      if (gs.lust > 20 && (moistCalc(2) > 3 || moistCalc(1) > 3)) { textLP(', the fabric quickly growing damp'); }
      textLP('.');
      if (gs.tail !== 0) { textLP('Your ' + tailDesc() + ' tail swishes across the ground in anticipation.'); }
    }
    if (chance > 75) { textL('You lick your finger before sliding it into your mouth, sucking and pulling it out slowly with a small drop of saliva dangling upon your supple lips while you rub the ' + cockDesc() + ' phallic outline in your ' + clothesBottomCl() + ' with your other hand.'); }
    if (gs.ePref === 3 || gs.ePref === 4) { doeLust(Math.floor(percent() / 10 + gs.eLib / 5)); }
    else if (gs.ePref === 1 || gs.ePref === 2) { doeLust(Math.floor(percent() / 10 + gs.eLib / 10)); }
  } else if (gs.gender === 0 && gs.ePref !== 0 && gs.eGen !== 0) {
    textL('Your ' + hipDesc() + ' hips dance provocatively while you lick and suckle your fingers, trying to show off what you can do with what you\'ve still got.');
    doeLust(Math.floor(percent() / 10 + gs.eLib / 10));
  } else {
    textL('Your attempt at an erotic display only seems to turn the ' + enemyName() + ' off further.');
    gs.eLust -= 5;
  }
}

export function battleWin(): void {
  textL('You walk away from the battle the victor and to the victor goes the spoils.');
  if (gs.eCoin !== 0) {
    textLP('\r\rSomewhere on the passed out body (you probably don\'t want to know where) you find ' + gs.eCoin + ' coins.');
    doCoin(gs.eCoin);
  }
  if (gs.eItem !== 0) { textLP('\r\rYou manage to obtain ' + itemName(gs.eItem) + ' from your opponent.'); }
  if (gs.eSexP !== 0) {
    textLP('\r\rFor your efforts, you grow in experience, gaining ' + gs.eSexP + ' SexP!');
    doSexP(gs.eSexP);
  }
  if (gs.eItem !== 0) { itemAdd(gs.eItem); }
  gs.hrs = 2;
  if (_doEnd) _doEnd();
}

export function doeHP(changes: number): void {
  if ((gs.eHP + changes) <= 0) {
    if (_specialKOWin) _specialKOWin();
    textLP('\r\r You win the battle!');
    if (gs.inBag === true) { gs.inBag = false; }
    gs.currentState = 1;
    if (_doNext) _doNext();
    gs.doListen = (): void => { battleWin(); };
  }
  gs.eHP += changes;
  if (gs.eHP > 0) { textLP('\r\rYour enemy now seems to be under ' + (Math.ceil(gs.eHP / gs.eMaxHP * 10) * 10) + '% Stamina.'); }
}

export function doeLust(changes: number): void {
  if (gs.eGen === 1) {
    if ((gs.eLust + changes) > 65 && gs.eLust <= 65) { textLP('\r\rThe ' + enemyName() + ' smears the pre across its rod, stroking it gently while fighting, majorly distracted.'); }
    else if ((gs.eLust + changes) > 40 && gs.eLust <= 40) { textLP('\r\rThe ' + enemyName() + ' squirms, pre dripping from the tip of its stiffness.'); }
    else if ((gs.eLust + changes) > 20 && gs.eLust <= 20) { textLP('\r\rThe ' + enemyName() + ' shifts a little, an erection clearly beginning to grow.'); }
  }
  if (gs.eGen === 2) {
    if ((gs.eLust + changes) > 65 && gs.eLust <= 65) { textLP('\r\rThe ' + enemyName() + ' smears the honey all over as it rubs itself constantly while fighting, majorly distracted.'); }
    else if ((gs.eLust + changes) > 40 && gs.eLust <= 40) { textLP('\r\rThe ' + enemyName() + ' squirms, honey dribbling from its naughty hole.'); }
    else if ((gs.eLust + changes) > 20 && gs.eLust <= 20) { textLP('\r\rThe ' + enemyName() + ' shifts a little, caressing its pussy here and there when it can.'); }
  }
  if (gs.eGen === 3) {
    if ((gs.eLust + changes) > 65 && gs.eLust <= 65) { textLP('\r\rThe ' + enemyName() + ' smears the lubricant all over as it rubs and strokes itself constantly while fighting, majorly distracted.'); }
    else if ((gs.eLust + changes) > 40 && gs.eLust <= 40) { textLP('\r\rThe ' + enemyName() + ' squirms, honey dribbling and pre dripping from its aroused genitals.'); }
    else if ((gs.eLust + changes) > 20 && gs.eLust <= 20) { textLP('\r\rThe ' + enemyName() + ' shifts a little, caressing its pussy here and there when it can while its erection clearly grows.'); }
  }
  gs.eLust += changes;
}

export function eDmg(eweapon: number): number {
  let dmgRed = 0;
  if (gs.sen > 0) { dmgRed = Math.floor((100 - gs.sen) / 2); }
  if (dmgRed > gs.level) { dmgRed = gs.level; }
  const dmg = Math.floor(percent() / eweapon + gs.eStr / 2 - dmgRed);
  // AS3 inherited bug fix: at high level + low sensitivity, dmgRed grows
  // large enough to make every enemy attack deal 0 damage — combat becomes
  // risk-free even from "the cock-snake whips around, slapping you harshly
  // …causing a painful welt". Floor at 1 so attacks that hit at all sting
  // for at least one HP. The eStr scaling still ensures stronger enemies
  // hit harder.
  return dmg < 1 ? 1 : dmg;
}

/** enemyAttack — runtime dispatch into per-enemy logic in Enemies.ts.
 *  Direct import works despite the Battling↔Enemies cycle because both
 *  modules reference each other only inside function bodies, not at module
 *  top-level. The previous indirection through `(gs as any).doEnemyAttack`
 *  failed silently when the registration call hadn't run yet (or when state
 *  restoration wiped the field) — every silent failure looked like the
 *  enemy "didn't attack", which is what the player saw as "I'm not taking
 *  any damage from opponents". */
export function enemyAttack(): void {
  enemyAttackImpl();
}

export function doEscape(): void {
  if (percent() <= (20 + gs.runMod)) {
    textL('You successfully run away!');
    if (gs.inDungeon === true) {
      regionChange(gs.currentZone);
      gs.inDungeon = false;
    }
    gs.currentState = 1;
    gs.hrs = 1;
    if (_doEnd) _doEnd();
  } else {
    textL('You fail to run away...');
    if (gs.currentState === 2) { enemyAttack(); }
    if (gs.currentState === 2) { doBattle(); }
  }
}
