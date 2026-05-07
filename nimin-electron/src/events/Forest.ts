// Ported from Events/Forest.as
import { gs } from '../core/GameState.ts'
import { textL, textLP } from '../ui/TextRenderer.ts'
import { doNext, buttonConfirm } from '../ui/ButtonManager.ts'
import { eventSelect } from '../screens/Exploration.ts'
import { doEnd } from '../core/GameEngine.ts'
import { itemAdd } from '../content/Items.ts'
import { doLust, doHP, doSexP } from '../systems/StatChanges.ts'
import { enemyBaseStats } from '../content/Enemies.ts'
import { doBattle } from '../systems/Battling.ts'
import { milkAmount, cumAmount } from '../core/Calculations.ts'
import { bustRatio } from '../content/Breasts.ts'
import { boobChange } from '../systems/Transformations.ts'
import { percent } from '../core/GameUtilities.ts'
import { hairstyleLength } from '../content/Hair.ts'
import { regionChange } from '../screens/EventUtilities.ts'
import { boobDesc, nipDesc, skinDesc, legDesc, legWhere } from '../content/Descriptions.ts'
import { clothesTop, clothesBottom } from '../content/Clothes.ts'

export function doForest(): void {
  const chance = eventSelect('Forest')

  if (chance === 1) {
    textL('Walking through the forest, you begin to hear footsteps mix with your own... As you pause to listen in, a creature jumps out before you! A lone wolf, it growls, ready to attack. And judging by the red rod that bobs beneath its belly, it\'s probably male, and probably frustrated after some failed encounter with a female...')
    doNext()
    gs.doListen = function(): void {
      gs.enemyID = 201
      gs.currentState = 2
      enemyBaseStats()
      gs.eMaxHP = gs.eHP
      doBattle()
    }
  } else if (chance === 2) {
    textL('Walking through the forest, you begin to hear footsteps mix with your own... As you pause to listen in, a creature jumps out before you! A lone wolf, it growls, ready to attack. The red rod that bobs beneath its belly indicate it is male, yet it doesn\'t carry itself like it would dominate a female. Rather, it looks like it is vicious enough to dominate other males, and maybe only males...')
    doNext()
    gs.doListen = function(): void {
      gs.enemyID = 202
      gs.currentState = 2
      enemyBaseStats()
      gs.eMaxHP = gs.eHP
      doBattle()
    }
  } else if (chance === 3) {
    textL('You hear a hiss from behind a tree. Stopping cautiously, you manage to avoid stepping on a particularly dangerous snake. The cock-snake. Aptly named due to its head looking much like the glans of a human cock, this breed of snake is also known to devour that of the same... And if its opponent doesn\'t have one, they soon will.')
    doNext()
    gs.doListen = function(): void {
      gs.currentState = 2
      gs.enemyID = 101
      enemyBaseStats()
      gs.eMaxHP = gs.eHP
      doBattle()
    }
  } else if (chance === 4) {
    // Magical flower sneeze
    textL('In the midst of the forest, an odd shadow cascades over your eyes. You glance up just in time to spot a star-shaped flower twirling down towards you. The vibrant blue petals are easy to make out from below and, oddly, don\'t match any of the foliage you see above. Wherever this flower came from, you step back in time to let it slowly drift down into your hands.\r\rThe iridescent topside of the petals shimmer beautifully, with the center glistening yellow and steadily oscillating like molten gold.\r\r\rWould you like to smell its wondrous scent?')
    buttonConfirm()
    gs.doListen = function(): void {
      if (gs.buttonChoice === 6) {
        textL('It just looks so magnificent that you can\'t help but stuff your nose in and take a big whiff.\r\rYou immediately regret your impulsive inhaling, as an intense tingle erupts within your nose. You\'re nearly forced to laugh from the intense tickling sensation, but considering the area being affected, you instead halt your breath. Your next attempt to breath only intensifies the sensation further, your chest heaving to hold back. But, you\'re simply not strong enough...\r\r"ACHOO!" You sneeze loud and hard. So hard, in fact, that ')
        let found = false
        while (!found) {
          const roll = Math.floor(Math.random() * 10) + 1
          if (roll === 1) {
            textLP('your hips stretch outward, becoming wider.')
            gs.hips += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 2) {
            textLP('your butt balloons outward behind you, straining your ' + clothesBottom() + '.')
            gs.butt += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 3 && hairstyleLength(gs.hair) && gs.hairLength < 10) {
            textLP('your hair suddenly grows faster than you can blink, much longer than before.')
            gs.hairLength += 2
            found = true
          } else if (roll === 4 && gs.cockTotal > 0) {
            textLP('your cock' + (gs.cockTotal > 1 ? 's' : '') + ' expand' + (gs.cockTotal > 1 ? '' : 's') + ' in your ' + clothesBottom() + ', nearly exploding through the fabric.')
            gs.cockSize += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 5 && gs.balls > 0 && gs.showBalls) {
            textLP('your testicles swell between your thighs, making you hunch over your crotch for an instant.')
            gs.ballSize += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 6 && gs.cockTotal > 0) {
            textLP('you blast your semen into your ' + clothesBottom() + ', a sudden spontaneous ejaculation.')
            cumAmount()
            doLust(-20, 0)
            found = true
          } else if (roll === 7 && bustRatio() > 1.07) {
            textLP('your breasts inflate, nearly tearing through your ' + clothesTop() + '.')
            gs.breastSize += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 8 && gs.lactation > 0) {
            textLP('all the milk in your breasts sprays out of your nipples, completely soaking your ' + clothesTop() + '.')
            milkAmount(1)
            found = true
          } else if (roll === 9 && gs.vagTotal > 0) {
            textLP('your vulva expands ' + legWhere(1) + ' your ' + legDesc(2) + ', squished between your thighs and making you walk awkwardly.')
            gs.vulvaSize += Math.floor(percent() / 20 + 1)
            found = true
          } else if (roll === 10 && gs.gender !== 0) {
            textLP('your blood floods to your genitals, suddenly arousing you.')
            doLust(Math.floor(percent() / 5), 0)
            found = true
          }
        }
        textLP(' You also managed to annihilate the flower...\r\rCaught off guard and quite confused, you stumble off, wondering if there\'s a tissue nearby.')
        gs.hrs += 2
        doEnd()
      } else {
        textL('Wary of strangely beautiful flowers that fall randomly from the sky, you decide to let it continue its path to the ground and head on your way.')
        gs.hrs += 1
        doEnd()
      }
    }
  } else if (chance === 5) {
    // Tentacle creature
    textL('You hear ominous swishing through the trees around you...')
    if (percent() < (10 + gs.runMod)) {
      textLP('\r\rYet you manage to run off before anything can catch you.')
      gs.hrs = 1
      doEnd()
    } else if (bustRatio() <= 1.07) {
      textLP('\r\rPeach-colored tentacles lash out at you from the tree-branches above, catching you by surprise. They flail around your chest, feeling about and groping it roughly.\r\rHowever, the tentacles seem to be uninterested and disappear as quick as they came, leaving you with a rather tender chest and wasted time.')
      doHP(-Math.floor(percent() / 10 + 2))
      gs.hrs = 1
      doEnd()
    } else if (gs.milkEngorgement >= 400 && gs.milkEngorgementLevel > 0) {
      textL('\r\rA mass of peach-colored tentacles falls from the tree-branches above. Some of the tentacles waver out towards you, mostly aiming at your ' + boobDesc() + ' chest. They seem rather non-threatening, however, as the mass rolls back and forth on the forest floor, almost as though it were a stumbling drunk.\r\rDo you allow the tentacles to come closer?')
      buttonConfirm()
      gs.doListen = function(): void {
        if (gs.buttonChoice === 6) {
          textL('Cautiously standing still, you wait as the tentacles come right up to your breasts. They caress your ' + nipDesc() + 'nipples, seemingly able to smell the milk within your breasts, and they wiggle even more like a drunk... It seems as though the creature smelled your large amount of milk production as you approached and became intoxicated by it.\r\r\rDo you let the creature indulge itself?')
          buttonConfirm()
          gs.doListen = function(): void {
            if (gs.buttonChoice === 6) {
              textL('You pull your ' + clothesTop() + ' up, letting your ' + boobDesc() + ' chest bob out, practically inviting it to partake of your motherly liquid. Not to forsake such an opportunity, the tentacled mass rolls up to you, the tentacles squirming about your ' + nipDesc() + 'nipples until they stand hard and erect. Yet, the tentacles pull away, caressing and hugging your body as the main mass comes right up to you.\r\rThe mass of tentacles part, revealing a feminine face, slender and beautiful, with eyes closed. The tentacles dance atop her head, seemingly replacing her hair. Looking down, you can see more of her lithe body, thin with milky skin. Two breasts, barely handfuls, wobble upon her chest as tentacles, particularly thinner than the rest, dance about where her nipples would be. Overall, she seems quite short, maybe 4 feet tall at most, while the mass of tentacles could easily reach 6 feet in height.')
              doNext()
              gs.doListen = function(): void {
                textL('The fair face moves up to one of your ' + boobDesc() + ' breasts, the little mouth yawning wide to fit one of your ' + nipDesc() + 'nipples. She latches on the best she can, suckling intently from your chest. You let out a gasp as her expert suckling makes your body grow warm, a delightful tingling sensation making you quiver. Milk gushes from your tits as she gulps it down. Tentacles much thicker than the rest droop from her hair, their tips opening into soft maws that suckle from and kiss the ' + skinDesc() + ' of your breasts, leaving none unattended. It doesn\'t take long before your body is wracked by an intense boobgasm...')
                doNext()
                gs.doListen = function(): void {
                  textL('Gasping for air as you come down from your climax, the feminine face and all the tentacles collapse, leaving hardly any milk still dribbling from your ' + nipDesc() + 'nipples. Checking the creature, she seems to have passed out in a drunken slumber. Her face seems content, with a small smile, her tentacles writhing lazily about her. Two tentacles in particular look surprisingly active, though. Her small breasts jiggle about as their tentacle-nipples stiffen and soften. They shiver as you run your hands along them, several feet long before you reach their tips. Short, narrow needles protrude from the tips of these tentacle-nipples and they dribble some pearlescant fluid excessivly. You take an empty vial from your bag and gather some of the fluid before heading on your way...')
                  doSexP(20)
                  gs.nipplePlay += 7
                  doLust(-Math.floor(gs.breastSize * gs.sen / 20), 0, 3)
                  milkAmount(1)
                  itemAdd(201)
                  gs.hrs = 2
                  doEnd()
                }
              }
            } else {
              textL('You take the opportunity to run from the tentacles before the creature can come to its senses, easily avoiding it.')
              doSexP(7)
              gs.hrs = 1
              doEnd()
            }
          }
        } else {
          textL('You take the opportunity to run from the tentacles before the creature can come to its senses, easily avoiding it.')
          doSexP(4)
          gs.hrs = 1
          doEnd()
        }
      }
    } else {
      // Forced tentacle injection
      textLP('\r\rPeach-colored tentacles lash out at you from the tree-branches above, catching you by surprise. They flail around your ' + boobDesc() + ' chest, feeling about and scratching it roughly. They pull back for a moment, but before you can recoup from your confused stupor, even more come flying out from the trees, this time whipping around your wrists and ' + legDesc(8) + '.\r\rStruggle as you may, you can\'t seem to wrench yourself free. You can only watch in fear as more tentacles pull your ' + clothesTop() + ' away and roam about your ' + boobDesc() + ' breasts. They poke and tease at your ' + nipDesc() + 'nipples, causing them to stand hard and erect. Then, short narrow needles draw out of two narrow tentacles. They drip with some sort of pearlescant fluid and they plunge gently into each of your ' + gs.boobTotal + ' fleshy masses...')
      doNext()
      gs.doListen = function(): void {
        boobChange(1)
        textL('A sudden feeling of warmth overcomes you. Your breasts feel especially hot, heaving with your breath. Staring dazedly, they even seem to grow slightly in size as the tentacles grope and massage them pleasurably.\r\rA moment later, your head jerks back as an intense feeling of fullness and swelling engulfs your sensitive tits. You recoil and watch streams of white liquid spew from your throbbing, ' + nipDesc() + 'nipples. Milk gushes before you, sprinkling over the ground as much thicker tentacles draw close. Their tips open into wet soft maws, showering themselves in the white rain, gulping the streams down all the way to the source. Each one latches onto your lactating breasts, sucking your ' + nipDesc() + ' nipples deep, drinking and suckling...\r\rYou feel slightly light-headed from the fuzzy warmth that engulfs you, the pleasurable slurping of the hungry tentacles draining you dry. Eventually, the tantalizing efforts make your body quiver, wracked by a steady orgasm from your ' + boobDesc() + ' breasts while the tentacles lap up the last of the fluids...')
        doNext()
        gs.doListen = function(): void {
          textL('A few minutes later, the tentacles retract from whence they came, leaving you to collapse to your ' + legDesc(6) + '. Your breasts still feel larger than before, especially when you stretch your ' + clothesTop() + ' back into place, along with a constant subtle warmth still emanating within. Wet blotches seep across the fabric, your ' + nipDesc() + 'nipples still dribbling with milk')
          if (gs.lactation <= 0) textLP(', but eventually dry back up as they were before, though slightly tingly')
          textLP('...')
          milkAmount(1)
          gs.nipplePlay += 20
          gs.milkCPoisonNip += 5
          doSexP(10)
          doLust(-Math.floor(gs.breastSize * gs.sen / 20), 0, 3)
          doHP(-Math.floor(percent() / 10))
          gs.hrs = 2
          doEnd()
        }
      }
    }
  } else if (chance === 6) {
    textL('After a few hours of being lost and randomly wandering through the maze of trees, you come across a path. Would you like to follow it?')
    buttonConfirm()
    gs.doListen = function(): void {
      if (gs.buttonChoice === 6) {
        if (!gs.firstExplore) {
          textL('You take a deep breath. You\'re finally doing it, you\'re actually going beyond your home. There\'s a sense of nervousness from the unknown, but at the same time a sense of exhilaration, like you\'re actually going to do something important. And for the first time since you\'ve started having those dreams, you don\'t feel anxious about your life. You step forward with a sense of relief.\r\r')
          gs.firstExplore = true
        } else {
          textL('')
        }
        if (gs.currentZone === 1) {
          textLP('Following the path, the trees grow slightly sparser as you come upon a large clearing. Most of the clearing has been walled off by tree-trunks lashed together with rope. You hear some vicious growls, but also plenty of coherent speech, echoing from behind the wall. A whole bustling city. The path you followed brings you right to the front gates, where furry wolf-like guards kindly greet you and allow you to pass.\r\rYou have now entered the Lupan home-city of Tieden! Although, looking behind you, there seems to be no sign of the path you just took. Getting back might be a bit difficult...')
          regionChange(3)
          if (!gs.foundTieden) gs.foundTieden = true
          gs.hrs = 4
          doEnd()
        } else if (gs.currentZone === 3) {
          textLP('Following the path, the trees grow much sparser opening up to rolling hills. Not far, you see tall buildings of wood and stone, with open streets of dirt and pebbles, nestled between the hills. Fur-less people move all about, busy doing odd jobs or having fun.\r\rYou have found the Human home-city of Softlik! Although, looking behind you, there seems to be no sign of the path you just took. Getting back might be a bit difficult...')
          regionChange(1)
          if (!gs.foundSoftlik) gs.foundSoftlik = true
          gs.hrs = 4
          doEnd()
        }
      } else {
        textL('You return from whence you came.')
        gs.hrs = 1
        doEnd()
      }
    }
  }
}
