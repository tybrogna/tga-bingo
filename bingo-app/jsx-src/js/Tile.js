export class Tile {
    text = ''
    description = ''
    imgLoc = ''
    // url = ''
    constructor(text, imgLoc="", description="") {
        this.text = text
        this.imgLoc = imgLoc
        this.description = description
        if (this.imgLoc != null) {
            // if (!this.imgLoc.startsWith('../bingo-24/')) {
            //     this.imgLoc = '../bingo-24/' + this.imgLoc
            // }
            if (!this.imgLoc.endsWith('.jpg')) {
                this.imgLoc = this.imgLoc + '.jpg'
            }
        }
        // this.url = getImageUrl(this.imgLoc)

        // this.url = new URL(`../bingo-24/${this.imgLoc}`, import.meta.url).href
        // console.log(this.url)
    }

    toString() {
        return `${this.imgLoc} for "${this.text}"`
    }
}
