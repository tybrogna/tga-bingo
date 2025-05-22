export class Tile {
    text = ''
    imgLoc = ''
    constructor(text, imgLoc) {
        this.text = text
        this.imgLoc = imgLoc
        if (this.imgLoc != null) {
            if (!this.imgLoc.startsWith('./img/bingo-23/')) {
                this.imgLoc = './img/bingo-24/' + this.imgLoc
            }
            if (!this.imgLoc.endsWith('.jpg')) {
                this.imgLoc = this.imgLoc + '.jpg'
            }
        }
    }
}

export const freeTile = new Tile('MARK CERNY PUTS HIS WII IN MY XBOX')
export const tileDataList = [
    [
        new Tile('Sega announces Virtua Fighter 6', 'vfwin'), new Tile('Sega’s new game is NOT Virtua Fighter', 'vflose')
    ],
    [
        new Tile('Alan Wake 2 wins more than 2 awards', 'aw2'), new Tile('Alan Wake 2 wins NO awards', 'aw2')
    ],
    [
        new Tile('Geoff makes reference to stage divers', 'stage'), new Tile('NEW STAGE DIVER', 'stage'),
    ],
    [
        new Tile('FFXIV wins GCBTW', 'gcbtw'), new Tile('FFXIV doesn\'t win the community award', 'gcbtw')
    ],
    [
        new Tile('Idris Elba wins cuz he\'s a Celebrity', 'elba'), new Tile('Neil Newbon wins because of Fandom Power', 'newbon')
    ],
    [
        new Tile('Capcom does something Resident Evil Related', 're'), new Tile('Capcom shows something that ISN\'T Resident Evil', 'dc')
    ],
    [
        new Tile('Konami tries to buy back goodwill with MGS3','mgs3'), new Tile('Konami tries to buy back goodwill with Silent Hill 2', 'shill')
    ],
    [
        new Tile('Atlus reminds us of Persona by showing a trailer of game that is already out', 'persona'),
        new Tile('Atlus desperately informs us that Metaphor Re Fantazio is the de facto Persona 6', 'mrf')
    ],
    new Tile('Zelda: Tears of the Kingdom DLC', 'zeldadlc'),
    new Tile('Baldur\'s Gate 3 wins game of the year', 'bgwin'),
    new Tile('Grand Theft Auto 6', 'vi'),
    new Tile('Dragon Age 4 appears', 'da'),
    new Tile('Fall Guys appears', 'fallguys'),
    new Tile('Another Fucking Surivial Crafting Game', 'survive'),
    new Tile('Another Fucking Retro Shooter Game', 'shoot'),
    new Tile('Another Fucking Arena/Hero Shooter', 'hero'),
    new Tile('Honkai Star Rail Trailer', 'hsr'),
    new Tile('Street Fighter 6 wins Best Fighting Game', 'ryu'),
    new Tile('Geoff interviews one of the Esports Dorks', 'esports'),
    new Tile('Geoff shows us a Former Friend (Hideo Kojima, Josef Fares, or Todd Howard)', 'friends'),
    new Tile('Geoff shows us a New Friend (NOT Hideo Kojima, Josef Fares, or Todd Howard)', 'newfriends'),
    new Tile('Gamepass ad', 'gp'),
    new Tile('Dad God DLC or Spinoff', 'blades'),
    new Tile('One of Obsidian\'s Three in development games appear', 'obsidian'),
    new Tile('Spider-Man 2 DLC features a non-Spider-Man related Marvel Character', 'px'),
    new Tile('Port or remake of game from the 90s', '90game'),
    new Tile('Port or remake of game from the 00s', '00game'),
    new Tile('Square Enix shows another goofy FFVIIRebirth trailer', 'viirb'),
    new Tile('Silksong', 'silk'),
    new Tile('That Ubisoft Star Wars Game', 'usw'),
    new Tile('Another Fucking MMO (Take a drink if it\'s Korean)', 'kmmo'),
    new Tile('Suicide Squad Returns', 'ssquad'),
    new Tile('Metroid Prime 2 Remaster', 'mp2'),
    new Tile('Metroid Prime 4......?', 'mp4'),
    new Tile('Diablo 4 new seasonal trailer', 'd4'),
    new Tile('Square enix announces Remake', 'ff9'),
    new Tile('Elden Ring DLC', 'elden'),
    new Tile('Hades II', 'hades'),
    new Tile('Dad God references speaking too long', 'judge'),
    new Tile('Death Stranding II', 'strand')
]
