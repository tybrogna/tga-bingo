import { freeTile, tileDataList } from './2024tga.js'

export function TileViewer(props) {
    return (
        <>
        <TileViewerSingleRow tileData={freeTile} />
        {tileDataList.map(tileData => {
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
    return (
        <div class='row full-tile-info'>
            <img class='col-4 img-in-view' src={props.tileData.url} onclick={toggleImageZoom} />
            <div class='col-8 p-2 tile-viewer-text'>
                <div class='tile-viewer-text-title'>
                    {props.tileData.text}
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