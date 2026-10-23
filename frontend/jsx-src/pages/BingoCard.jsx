import { render } from 'preact'
import { useRoute } from 'preact-iso'
import { useState, useEffect } from 'preact/hooks'
import { getPRNG, shuffle } from '../../js/randomHelper.js'
import { $, isLocalhost, delay } from '../../js/functionhider.js'
import { TileViewer, compressAllImages } from './TileViewer.jsx'
import { Tile } from '../../js/Tile.js'
import { words } from '../../js/words.js'
import TopMenuBar from './TopMenuBar.jsx'
import correctImg from '../img/correct25.png'
import closeImg from '../img/close25.png'
import bingoImg from '../img/bingo25.png'
import favicon from '../img/favicon25.ico'

import '../styles/cardPage.scss'

let path = ""
let eventName = ""
let eventYear = ""
let isLocal = isLocalhost()
let randomWord = () => { return words[Math.floor(Math.random() * words.length)] }

let bingoObj = { }

let bingoDesc = {
    'B1': [], 'I1': [], 'N1': [], 'G1': [], 'O1': [],
    'B2': [], 'I2': [], 'N2': [], 'G2': [], 'O2': [],
    'B3': [], 'I3': [], 'N3': [], 'G3': [], 'O3': [],
    'B4': [], 'I4': [], 'N4': [], 'G4': [], 'O4': [],
    'B5': [], 'I5': [], 'N5': [], 'G5': [], 'O5': [],
}
const bingoLetters = ['B','I','N','G','O']
const colNumbers = [1,2,3,4,5]
let lastZone = ""

function BingoSkeleton(props) {
    let [ viewerDisplayed, setViewerDisplayed ] = useState(false)
    let [ viewerWasRendered, setViewerWasRendered ] = useState(false)
    let [ cardSeed, setCardSeed ] = useState()
    let [ tiles, setTiles ] = useState([])
    
    // #TODO use algorithmic name and years
    $('body').addEventListener('click', event => {
        if (event.target.tagName == 'BODY' || event.target.id == 'tile-list-empty' || event.target.id == 'viewer-overlay') {
            setViewerDisplayed(false)
            compressAllImages()
        }
    })

    useEffect(() => {
        let defaultSeed
        if (localStorage.getItem('seed')) {
            defaultSeed = localStorage.getItem('seed')
        } else {
            defaultSeed = `${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()}`
        }
        $('#seed-box').value = defaultSeed
        setCardSeed(defaultSeed)

        let eventTitle = "Geoff Keighley's The Game Awards 2025".toUpperCase()
        $("#event-title").innerHTML = eventTitle

    }, []) // do only once after page loads

    useEffect(async () => {
        let storedSeed
        if (localStorage.getItem('seed')) {
            storedSeed = localStorage.getItem('seed')
        }
        if (cardSeed != storedSeed) {
            localStorage.setItem('seed', cardSeed)
        }

        let tiles = await newFetchShuffledTiles(cardSeed, props.eventName, props.eventYear)
        setTiles(tiles)
        sortTiles()
        revealTiles()
    }, [cardSeed]) // do when cardSeed changes

    let regenerateClicked = (e) => {
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
        setCardSeed($('#seed-box').value)
    }

    useEffect(() => {
        if (viewerDisplayed) {
            $("#viewer-overlay").style.display = "block"
            $("#tile-list-zone").style.display = "block"
            // if (!viewerWasRendered) {
                // renderTileViewer($('tile-list-zone'), path, eventName, eventYear)
            // }
        } else {
            $("#viewer-overlay").style.display = "none"
            $("#tile-list-zone").style.display = "none"
        }
    }, [viewerDisplayed]) // do when viewerDisplayed Changes

    return (
    <>
    <title>Bingo: The Game Awards 2024</title>
    {/* <link rel="icon" href={favicon} /> */}
    <div id="main" className="container widener">
        <TopMenuBar />
        <div id="content" className="shell pl-5 pr-5">
            <h2 id="event-title" className="text-center">
                HEY KID WANNA PLAY BINGO
            </h2>
            <TitleAndHeader visible={true} />
            <div id="tile-zone">
                <BingoCard tiles={tiles}/>
            </div>
            <div class="row pt-3 pb-3">
                <div class="col">
                    <span class='pr-2'>Card Seed</span>
                    <input type='text' id="seed-box" class='mr-2' value={cardSeed}></input>
                    {/* <button id="regen" onClick={() => regenerateCard($('#tile-zone'))}>Regenerate</button> */}
                    <button id="new-regen" onClick={regenerateClicked}>Regenerate</button>
                </div>
                <div class="col justify-content-end d-flex">
                    {/* <button id="listTiles" onClick={displayViewerOverlay}>List tiles</button> */}
                    <button id="listTiles" onClick={e => setViewerDisplayed(!viewerDisplayed)}>List tiles</button>
                </div>
            </div>
            <div id="viewer-overlay" class="container widener">
                <div id="content" class="shell pl-5 pr-5" style="visibility: hidden;">
                    <h2 id="event-title" class="text-center" style="visibility: hidden;">GEOFF KEIGHLEY'S THE GAME AWARDS 2024</h2>
                    <TitleAndHeader visible={false} />
                    <div id="tile-zone" style="visibility: hidden;">
                        <div id="tile-list-empty" style="visibility: visible; max-height: 825px;" class="row align-items-end pr-2 pt-2">
                            <div class="col-4" style="visibility: visible;"></div>
                            <div id="tile-list-zone" style="display: block;" class="col-8">
                                <TileViewer eventName={props.eventName} eventYear={props.eventYear} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id='helper-overlay' onClick={hideHelperOverlay}>
                <img id='overlay-image' />
                <div id='helper-overlay-box'>
                    Some bingo boxes have mutually exclusive events ("X game wins" vs "Y game wins").
                    <br />
                    In that case, you can submit multiple tiles (up to three) that can't appear on the same board with each other.
                </div>
            </div>
    {/* </PageShell> */}
        </div>
    </div>
    </>
    )
}

function TitleAndHeader(props) {
    let titleClasses = "row pt-2 pb-2".concat(props.visible ? "" : " vis-hidden")
    return (
        <div className={titleClasses} >
            <div className="text-center txt-header-widen box-shadow">
                <span className="geoff-text">G</span>
            </div>
            <div className="text-center txt-header-widen box-shadow">
                <span className="geoff-text">E</span>
            </div>
            <div className="text-center txt-header-widen box-shadow">
                <span className="geoff-text">O</span>
            </div>
            <div className="text-center txt-header-widen box-shadow">
                <span className="geoff-text">F</span>
            </div>
            <div className="text-center txt-header-widen box-shadow">
                <span className="geoff-text">F</span>
            </div>
        </div>
    )
}

function Footer(props) {
    return (
        <div class="row pt-3 pb-3">
            <div class="col">
                <span class='pr-2'>Card Seed</span>
                <input type='text' id="seed-box" class='mr-2' value=''></input>
                <button id="regen" onClick={() => regenerateCard($('#tile-zone'))}>Regenerate</button>
            </div>
            <div class="col justify-content-end d-flex">
                <button id="listTiles" onClick={displayViewerOverlay}>List tiles</button>
            </div>
        </div>
    )
}

function HelperOverlay() {
    return (
        <>
        <div id='helper-overlay' onClick={hideHelperOverlay}>
            <img id='overlay-image' />
            <div id='helper-overlay-box'>
                Some bingo boxes have mutually exclusive events ("X game wins" vs "Y game wins").
                <br />
                In that case, you can submit multiple tiles (up to three) that can't appear on the same board with each other.
            </div>
        </div>
        </>
    )
}

async function newFetchShuffledTiles(seed,event,year) {
    let shuffledRes, shuffled

    if (event != undefined && year != undefined) {
        shuffledRes = await fetch(`/api/getTiles/${eventName}/${eventYear}/${seed}`)
    } else {
        shuffledRes = await fetch(`/api/getTiles/active/${seed}`)
    }

    try {
        shuffled = await shuffledRes.json()
    } catch (e) { shuffled = [] }

    while (shuffled.length < 25) {
        let len = shuffled.length
        shuffled.push({
            "title": "Data Missing " + (len + 1),
            "description": "Doesn't exist",
            "img_loc": ""
        })
    }

    // the free tile comes in as number 0, so i dont have to do any wacky db shennanigans
    let temp = shuffled[0]
    shuffled[0] = shuffled[12]
    shuffled[12] = temp

    return shuffled
}

function BingoCard(props) {
    if (props.tiles.length == 0) {
        return
    }
    return (
        <>
            <BingoRow num={1} tiles={props.tiles.slice(0, 5)} />
            <BingoRow num={2} tiles={props.tiles.slice(5, 10)} />
            <BingoRow num={3} tiles={props.tiles.slice(10, 15)} />
            <BingoRow num={4} tiles={props.tiles.slice(15, 20)} />
            <BingoRow num={5} tiles={props.tiles.slice(-5)} />
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
    let imgUrl = (isLocal ? 'http://localhost:3001/' : '/') + tileData.img_loc
    bingoDesc[id] = tileData.description
    return (
        <div id={id} class={tileClasses} onclick={swapTickVisibility}>
            <div class="helper-target" onclick={showDescription}>?</div>
            <img id='imgbox' class={imgClasses} src={imgUrl} />
            <div id='title-text-box' class='tile-text'>{tileData.title}</div>
            <div id='checkbox'>
                <img id='tick' class='tick-standard tick-hidden' src={correctImg} />
            </div>
        </div>
    )
}

function showDescription(event) {
    event.stopPropagation()
    displayHelperOverlay(bingoDesc[event.target.parentElement.id])
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
    bingoObj = {
        'B': [], 'I': [], 'N': [], 'G': [], 'O': [],
        '1': [], '2': [], '3': [], '4': [], '5': []
    }

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

function checkBingo() {

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

async function displayViewerOverlay() {
    $("#viewer-overlay").style.display = "block"
    $("#tile-list-zone").style.display = "block"
    // renderTileViewer($('#tile-list-zone'), path, eventName, eventYear)
}

async function hideViewerOverlay() {
    $("#viewer-overlay").style.display = "none"
    $("#tile-list-zone").style.display = "none"
}

async function displayHelperOverlay(text) {
    $("#helper-overlay").style.display = "block"
    $("#helper-overlay-box").innerText = text
    // document.querySelector("#tile-list-zone").style.display = "block"
}

async function hideHelperOverlay() {
    $("#helper-overlay").style.display = "none"
    // document.querySelector("#tile-list-zone").style.display = "none"
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
    checkBingo()
}


export default function() {
    path = useRoute().path
    eventName = useRoute().params.eventName
    eventYear = useRoute().params.eventYear // #TODO this is caveman shit
    render(BingoSkeleton({path, eventName, eventYear}), document.querySelector('body'))
}
