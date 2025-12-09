import { render } from 'preact'
import { isLocalhost } from '../js/functionhider.js'
// import { freeTile, tileDataList } from '../js/2024tga.js'

let isLocal = isLocalhost()

export async function renderTileViewer(zone, eventName, eventYear) {
    let eventTiles = await fetchAllTiles(eventName, eventYear)
    render(TileViewer(eventTiles), zone)
}

async function fetchAllTiles(eventName, eventYear) {
    let eventTiles
    if (path.startsWith('/past')) {
        eventTiles = await fetch(`/getAllTiles/${eventName}/${eventYear}`)
    } else {
        eventTiles = await fetch(`/getAllTiles/active`)
    }
    return await eventTiles.json()
}

export function TileViewer(props) {
    return (
        <>
        {/* <TileViewerSingleRow tileData={freeTile} /> */}
        {props.map(tileData => {
            if (tileData.length > 0) {
                return (
                    <div class='linked-tile-binding'>
                    <>
                        {tileData.map(tile => (<TileViewerSingleRow tileData={tile} />))}
                    </>
                    </div>
                )
            } else {
                return <TileViewerSingleRow tileData={tileData}/>
            }
        })}
        </>
    )
}

function TileViewerSingleRow(props) {
    let imgUrl = (isLocal ? 'http://localhost:3001/' : 'https://tga.bingo/') + props.tileData.img_loc
    return (
        <div class='row full-tile-info'>
            <img class='col-4 img-in-view' src={imgUrl} onclick={toggleImageZoom} />
            <div class='col-8 p-2 tile-viewer-text'>
                <div class='tile-viewer-text-title'>
                    {props.tileData.title}
                </div>
                <div class='tile-viewer-text-description'>
                    {props.tileData.description}
                </div>
            </div>
        </div>
    )
}

export function compressAllImages() {
    let imgEles = document.querySelectorAll('#tile-list-zone img')
    imgEles.forEach(imgEle => {
        compressImage(imgEle)
    })
}

function toggleImageZoom(event) {
    if (event.target.classList.contains('img-in-view')) {
        expandImage(event.target)
    } else if (event.target.classList.contains('img-in-view-zoom')) {
        compressImage(event.target)
    }
}

function expandImage(imgEle) {
    imgEle.parentElement.classList.add('justify-content-center')
    imgEle.classList.remove('col-4', 'img-in-view')
    imgEle.classList.add('col-12', 'img-in-view-zoom')
    imgEle.parentElement.querySelector('.tile-viewer-text').style = 'height: fit-content'
}

function compressImage(imgEle) {
    imgEle.parentElement.classList.remove('justify-content-center')
    imgEle.classList.remove('col-12', 'img-in-view-zoom')
    imgEle.classList.add('col-4', 'img-in-view')
    imgEle.parentElement.querySelector('.tile-viewer-text').style = ''
}
