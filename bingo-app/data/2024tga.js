export class Tile {
    text = ''
    imgLoc = ''
    constructor(text, imgLoc) {
        this.text = text
        this.imgLoc = imgLoc
        if (this.imgLoc != null) {
            if (!this.imgLoc.startsWith('./bingo-24/')) {
                this.imgLoc = './bingo-24/' + this.imgLoc
            }
            if (!this.imgLoc.endsWith('.jpg')) {
                this.imgLoc = this.imgLoc + '.jpg'
            }
        }
    }

    toString() {
        return `${this.imgLoc} for "${this.text}"`
    }
}

export const freeTile = new Tile('Tekken 8 Not Nominated for Best Score and Music', 'jamz')
export const tileDataList = [
    [
        new Tile('Switch 2?!?!!?', 'switch2'), new Tile('no switch 2', 'noswitch2')
    ],
    [
        new Tile('Black Myth Wukong wins anything', 'wkwin'), new Tile('Black Myth Wukong wins nothing', 'wklose')
    ],
    [
        new Tile('The same game wins GotY and Game Direction', 'spiderman'), new Tile('Different Games win GotY and Game Direction', 'nospiderman')
    ],
    [
        new Tile('FFVII Rebirth wins Game of the Year', 'ffviiwin'), new Tile('Elden Ring reclaims GotY', 'erer'), new Tile('Dark horse Balatro wins GotY', 'joker')
    ],
    [
        new Tile('ASTRO BOT wins more than two awards', 'bot'), new Tile('ASTRO BOT wins zero awards', 'toro')
    ],
    [
        new Tile('Best Fighting Game: a game that actually came out this year wins', 'hgwells'), new Tile('Best Fighting Game: A port/enhanced version wins', 'bttf')
    ],
    [
        new Tile('Best Family Game: Nintendo game wins', 'mario'), new Tile('Best Family Game: Non-Nintendo game wins', 'bot')
    ],
    [
        new Tile('Best Sports/Racing Game: A game with "24" in its title wins', '2k4'), new Tile('Best Sports/Raching Game: A game with "25" in its title wins', '2k5')
    ],
    [
        new Tile('Best Esports game: Valve game wins', 'valve'), new Tile('Best Esports Game: Riot game wins', 'riot')
    ],
    [
        new Tile('Borderlands 4 trailer uses fake word to describe number of guns', 'bazillion'), new Tile('Borderlands 4 triler has a dramatic, serious tone', 'bl4')
    ],
    [
        new Tile('Sydnee Goodman wears a sparkly dress', 'sparkle'), new Tile('Sydnee Goodman wears a non-sparkly dress', 'matte')
    ],
    new Tile('One of the celebrity guests says they don\'t play many video games', 'pacino'),
    new Tile('Josef Fares drops an F-Bomb while describing his new game', 'fares'),
    new Tile('New Tekken character is a crossover character', 'gon'),
    new Tile('Expansion/DLC for a game released this year', 'sblade'),
    new Tile('Geoff interviews a cringe content creator (they\'re all cringe)', 'tiktok'),
    new Tile('Geoff interviews an esports dork (they\'re all dorks)', 'mtndew'),
    new Tile('Fortnite collab announcement', 'fnite'),
    new Tile('Marvel rivals ad', 'rivals'),
    new Tile('FFXIV jumpscare', 'meteor'),
    new Tile('Halo unreal jumpscare', 'chief'),
    // new Tile('Metroid Prime!', 'mp4'),
    new Tile('Any of MS\'s missing projects appears (Everwilds, State of Decay 3, Outer Worlds 2, etc)', 'hell'),
    new Tile('New Season of ongoing game announcement', 'stonks'),
    new Tile('"Available Right Now!"', 'boom'),
    new Tile('Silksong', 'clown'),
    new Tile('Virtua Fighter shows up somehow', 'missing'),
    new Tile('Personnel from last year\'s winner presents/appears (Alan Wake 2, BG3, Zelda)', 'veggie'),
    new Tile('Big name property goes mobile', 'wow'),
    new Tile('Arknights/Genshin/Star Rail/ZZZ/Nikki', 'gatcha'),
    // new Tile('Geoff Friend™®© (Industry professional who has been onstage before)', 'friends'),
    new Tile('Next Battlefield game', 'bf6'),
    new Tile('New or Upcoming Konami Game', 'tokimeki'),
    new Tile('Another Fucking MMO (drink if its korean)', 'kmmo'),
    new Tile('Gamepass ad', 'gp'),
    new Tile('Crazy Taxi, Golden Axe, Jet Set, Shinobi or Streets of Rage reappears', 'sega'),
    new Tile('No Man\'s Sky or Light No Fire', 'hello'),
    new Tile('Big Name Mystery game from last year reappears (Exodus, Kemuri, Last Sentinel, OD)', 'mbox'),
    new Tile('Monster Hunter Wilds', 'mhw'),
    new Tile('Naughty Dogg\'s next game', 'crash'),
    new Tile('Insomniac\'s next game', 'spyro'),
    new Tile('New Nintendo game for switch 2 (or with a suspicious lack of confirmed platforms)', 'jumpman'),
    new Tile('Previous Xbox-only game goes multiplatform', 'lucky'),
    new Tile('Dead franchise gets revived (no release in 7+ years)', 'breathoffire'),
    new Tile('VR Game', 'quest'),
    new Tile('Grand Theft Auto 6', 'gta6'),
    new Tile('Crazy looking Chinese AAA game', 'china'),
    new Tile('Someone references "Please Wrap It Up"', 'wrap')
]
