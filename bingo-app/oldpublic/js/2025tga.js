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
    new Tile('Silksong', 'clown'),
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