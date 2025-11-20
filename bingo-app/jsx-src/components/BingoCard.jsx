import { render } from 'preact'
import { getPRNG, shuffle } from '../js/randomHelper.js'
import { freeTile, tileDataList } from '../js/2024tga.js'
import { delay } from '../js/functionhider.js'
import correctImg from '../bingo-24/correct.png'
import closeImg from '../bingo-24/close.png'
import bingoImg from '../bingo-24/bingo.png'

import '../styles/cardPage.scss'

import { BingoSkeleton } from './bingoSkeleton.jsx'
import { TileViewer } from './TileViewer.jsx'

let year = "2024"
let event = "TGA".toLocaleLowerCase()
let cardCode = year + event
console.log(`./js/${cardCode}.js`)

let bingoObj = {
    'B': [], 'I': [], 'N': [], 'G': [], 'O': [],
    '1': [], '2': [], '3': [], '4': [], '5': []
}
const bingoLetters = ['B','I','N','G','O']
const colNumbers = [1,2,3,4,5]
let lastZone = ""

export async function generateCard(zone) {
    if (zone == null) return
    lastZone = zone
    let tiles = await fetch('/getTiles')
    render(BingoCard(tileDataList), zone)
    sortTiles()
    revealTiles()
}

export function regenerateCard(zone) {
    if (zone == null) { zone = lastZone }
    colNumbers.forEach((num) => {
        bingoLetters.forEach((letter) => {
            let tileEle = document.querySelector('#' + letter + num)
            tileEle.classList.remove('tile-anim')
            if (tileEle.querySelector('#tick').classList.contains('tick-visible')) {
                tileEle.querySelector('#tick').classList.remove('tick-visible')
                tileEle.querySelector('#tick').classList.add('tick-hidden')
            }
        })
    })
    localStorage.setItem('seed', document.querySelector('#seed-box').value)
    render(BingoCard(tileDataList), zone)
    checkBingo()
    revealTiles()
}

function BingoCard(props) {
    let shuffled = getShuffleTiles(props)
    return (
        <>
            <BingoRow num={1} tiles={shuffled.slice(0, 5)} />
            <BingoRow num={2} tiles={shuffled.slice(6, 11)} />
            <BingoRow num={3} tiles={shuffled.slice(11, 16)} />
            <BingoRow num={4} tiles={shuffled.slice(16, 21)} />
            <BingoRow num={5} tiles={shuffled.slice(-5)} />
        </>
    )
}

function BingoRow(props) {
    let tileProps = []
    bingoLetters.forEach((letter, index) => {
        let tileData = props.tiles[index]

        let nextTileProps = {
            'id': letter + props.num,
            'tileClasses': getTileClassList(letter, props.num),
            'imgClasses': 'imgop clamp-size ' + getImgClassList(letter, props.num),
            'tileData': tileData
        }

        if (nextTileProps.id == 'N3') {
            nextTileProps.tileData = freeTile
        }

        tileProps.push(nextTileProps)
    })

    return (
        <div class='row'>
            <BingoTile items={tileProps[0]} />
            <BingoTile items={tileProps[1]} />
            <BingoTile items={tileProps[2]} />
            <BingoTile items={tileProps[3]} />
            <BingoTile items={tileProps[4]} />
        </div>
    )
}

function BingoTile(props) {
    let { id, tileClasses, imgClasses, tileData } = props.items
    let tile = (
        <div id={id} class={tileClasses} onclick={swapTickVisibility}>
            <img id='imgbox' class={imgClasses} src={tileData.url} />
            <div id='title-text-box' class='tile-text'>{tileData.text}</div>
            <div id='checkbox'>
                <img id='tick' class='tick-standard tick-hidden' src={correctImg} />
            </div>
        </div>
    )
    return tile
}

function getTileClassList(letter, num) {
    let classes = 'tile-standard '
    if (letter == 'B') {
        classes += 'pl-1 '
    }
    if (num == 5) {
        classes += 'pb-1 '
    }
    classes += getImgClassList(letter, num)
    return classes
}

function getImgClassList(letter, num) {
    let classes = ''
    if (letter == 'B') {
        if (num == 1) {
            classes += 'tl-round '
        } else if (num == 5) {
            classes += 'bl-round '
        }
    }
    else if (letter == 'O' && num == 1) {
        classes += 'tr-round'
    }
    if (num == 5) {
        if (letter == 'O') {
            classes += 'br-round '
        }
    }
    return classes
}

function sortTiles() {
    let bingoTiles = document.querySelector('#tile-zone').querySelectorAll('.tile-standard')

    bingoTiles.forEach((ele) => {
        if (ele.id.startsWith('B')) {
            bingoObj['B'].push(ele)
        }
        if (ele.id.startsWith('I')) {
            bingoObj['I'].push(ele)
        }
        if (ele.id.startsWith('N')) {
            bingoObj['N'].push(ele)
        }
        if (ele.id.startsWith('G')) {
            bingoObj['G'].push(ele)
        }
        if (ele.id.startsWith('O')) {
            bingoObj['O'].push(ele)
        }
        if (ele.id.endsWith('1')) {
            bingoObj['1'].push(ele)
        }
        if (ele.id.endsWith('2')) {
            bingoObj['2'].push(ele)
        }
        if (ele.id.endsWith('3')) {
            bingoObj['3'].push(ele)
        }
        if (ele.id.endsWith('4')) {
            bingoObj['4'].push(ele)
        }
        if (ele.id.endsWith('5')) {
            bingoObj['5'].push(ele)
        }
    })
}

export async function revealTiles() {
    let tileAs2DArray = Array.from([bingoObj[1], bingoObj[2], bingoObj[3], bingoObj[4], bingoObj[5]])
    let flatArray = [].concat(...tileAs2DArray)
    flatArray = shuffle(flatArray)
    await delay(100)
    for (let a = 0; a < flatArray.length; a ++) {
        let wait = Math.floor(Math.random() * 2)
        if (wait == 1) {
            await delay(100)
        } // 0 means no delay
        flatArray[a].classList.add('tile-anim')
    }
}

let ticking = 0
function checkBingo() {
    ticking -= 1
    if (ticking > 0) {
        return
    }

    for (const [key, value] of Object.entries(bingoObj)) {
        value.forEach(tile => {
            tile.classList.remove('win')
            tile.querySelector('#tick').src = correctImg
        })
    }

    checkBingoTiles([bingoObj['B'][0], bingoObj['I'][1], bingoObj['N'][2], bingoObj['G'][3], bingoObj['O'][4]])
    checkBingoTiles([bingoObj['B'][4], bingoObj['I'][3], bingoObj['N'][2], bingoObj['G'][1], bingoObj['O'][0]])
    for (const [key, value] of Object.entries(bingoObj)) {
        let numMarked = checkBingoTiles(value)
    }
}

function checkBingoTiles(tileArr) {
    let markedTicks = []
    let tickCount = 0
    for (let a = 0; a < tileArr.length; a ++) {
        if (tileArr[a].querySelector('#tick').classList.contains('tick-visible')) {
            tickCount += 1
        }
    }
    if (tickCount == 4) {
        for (let a = 0; a < tileArr.length; a ++) {
            tileArr[a].querySelector('#tick').src = closeImg
        }
    } else if (tickCount == 5) {
        for (let a = 0; a < tileArr.length; a ++) {
            tileArr[a].querySelector('#tick').src = bingoImg
            tileArr[a].classList.add('win')
        }
    }
}

async function getShuffleTilesServerSide() {
    let seed = localStorage.getItem('seed')
    let random = getPRNG(seed)
    let eventMarkedTilesSize = await fetch(`/tiles/eventid/${eventId}`,).then(res => res.json())
    return shuffle([...Array(eventMarkedTilesSize).keys()], random).map(async id => {
        let tile, reducedTile
        tile = await fetch(`/tiles/id/${id}`).then(res => res.json())
        if (tile.length > 0) {
            let pick = Math.floor(random() * tile.length)
            reducedTile = tile[pick]
        } else {
            reducedTile = tile
        }
        return reducedTile
    })
}

function getShuffleTiles(tilesToShuffle) {
    let seed = localStorage.getItem('seed')
    let random = getPRNG(seed)
    return shuffle(tilesToShuffle, random).map(tile => {
        let reducedTile
        if (tile.length > 0) {
            let pick = Math.floor(random() * tile.length)
            reducedTile = tile[pick]
        } else {
            reducedTile = tile
        }
        return reducedTile
    })
}

function swapTickVisibility(event) {
    let tickTarget = event.target.closest('.tile-standard').querySelector('#tick')
    if (tickTarget.classList.contains('tick-visible')) {
        tickTarget.classList.remove('tick-visible')
        tickTarget.classList.add('tick-hidden')
    } else {
        tickTarget.classList.remove('tick-hidden')
        tickTarget.classList.add('tick-visible')
    }
    ticking += 1
    setTimeout(checkBingo, 500)
}

export default function() {
    render(BingoSkeleton(), document.querySelector('body'))
    let eventTitle = "Geoff Keighley's The Game Awards 2024".toUpperCase()
    document.querySelector("#event-title").innerHTML = eventTitle
    generateCard(document.querySelector('#tile-zone'))
    render(TileViewer(), document.querySelector('#tile-list-zone'))
}
