export class Tile {
    text = ''
    imgLoc = ''
    constructor(text, imgLoc) {
        this.text = text
        this.imgLoc = imgLoc
        if (this.imgLoc != null) {
            if (!this.imgLoc.startsWith('./bingo-25/')) {
                this.imgLoc = './bingo-25/' + this.imgLoc
            }
            if (!this.imgLoc.endsWith('.jpg')) {
                this.imgLoc = this.imgLoc + '.jpg'
            }
        }
    }
}

// DO NOT FEATURE:
//  Geoff interviewing anyone, they dont do that anymore
//  anti drug ads, they weren't at 2024
//  surprise celeb guest is becoming a pattern (pacino, ford)
//  try not to "predict" the goty, make a tile for categories that are either/or (eg, japanese game/non-j game wins)
//  
// things CONFIRMED at the show:
// exodus trailer 
// neon giant's new game (The Ascent studio) (likely to be a first person imsim)
// re requiem shows a classic character (leon, jill, chris)
// phantom blade 0 release date
//
// things LIKELY at the show:
// Silent Hill remake reveal
// prince of persia sands of time remake
// control 2, or something called control resonant
// marathon to be re-revealed
// fornite chapter 8
// diablo 4 expansion
// cod blops 7 zombies
// 007 first light (jsut a guess)
// crimson desert (very close to release)
// resident evil 9 (very close to release)
// playground's fable 2026
// RGG studios project century
// eidos montreal new game
// acknowledgement of hololive partnership
// 2XKO console trailer/new character
// larian new game, releated to statue
// tainted grail fall of avalon dlc
// wolverine release date
//
// NOT APPEARING:
// the witcher 4
// assassin's creed black flag remake
//
// long shots:
// saros (release date is close)
// 
export const freeTile = new Tile('', '')
const initalList = [
    [
        new Tile('Sydnee Goodman wears a sparkly dress', 'sparkle'), new Tile('Sydnee Goodman wears a non-sparkly dress', 'matte')
    ],
    new Tile('"Full Trailer on [Media Platform]"', ''),
    new Tile('Award recipient gets confused about stage cues/crowd flow', ''),
    new Tile('Mobile service game from last year reappears (Steel Paws, ARAD DnF, GoT Kingsroad)', ''),
    new Tile('Minor celebrity announces game they\'re acting in', ''),
    new Tile('Dead franchise gets revived (no release in 7+ years)', ''),
    new Tile('Personnel from last year\'s winner presents/appears (Astrobot, Metaphor)', ''),
    // new Tile('Silksong', 'clown'),
    new Tile('Update/expansion for game that DIDN\'T come out this year', ''),
    new Tile('Update/expansion for game that came out this year', ''),
    new Tile('Someone makes reference to the "what really is an indie game" debate', ''),
]

const yearEndList = [

]

let combinedLists = []
export const tileDataList = (() => {
    if (combinedLists.length > 0) {
        return combinedLists
    }
    combinedLists.push(...initalList).push(...yearEndList)
    return combinedLists
})()