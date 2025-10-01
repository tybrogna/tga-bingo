import { compressAllImages } from './TileViewer'
import { regenerateCard } from './BingoCard'


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
    if (!localStorage.getItem('seed')) {
        localStorage.setItem('seed', 'Enter your name or email or something')
    }
    let seedBoxVal = localStorage.getItem('seed')
    return (
        <div class="row pt-3 pb-3">
            <div class="col">
                <span class='pr-2'>Card Seed</span>
                <input type='text' id="seed-box" class='mr-2' value={seedBoxVal}></input>
                <button id="regen" onClick={() => regenerateCard(document.querySelector('#tile-zone'))}>Regenerate</button>
            </div>
            <div class="col justify-content-end d-flex">
                <button id="listTiles" onClick={displayOverlay}>List tiles</button>
            </div>
        </div>
    )
}

export function BingoSkeleton(props) {
    document.querySelector('body').addEventListener('click', event => {
        if (event.target.tagName == 'BODY' || event.target.id == 'tile-list-empty' || event.target.id == 'overlay') {
            hideOverlay()
            compressAllImages()
        }
    })

    return (
    <>
    <title>Bingo: The Game Awards 2024</title>
    <link rel="icon" href="/img/favicon24.ico" />
    <div id="main" className="container widener">
        <div id="content" className="shell pl-5 pr-5">
            <h2 id="event-title" className="text-center">
                HEY KID WANNA PLAY BINGO
            </h2>
            <TitleAndHeader visible={true} />
            <div id="tile-zone">
                {/* target of generateCard */}
            </div>
            <Footer />
            <div id="overlay" class="container widener">
                <div id="content" class="shell pl-5 pr-5" style="visibility: hidden;">
                    <h2 id="event-title" class="text-center" style="visibility: hidden;">GEOFF KEIGHLEY'S THE GAME AWARDS 2024</h2>
                    <TitleAndHeader visible={false} />
                    <div id="tile-zone" style="visibility: hidden;">
                        <div id="tile-list-empty" style="visibility: visible; max-height: 825px;" class="row align-items-end pr-2 pt-2">
                            <div class="col-4" style="visibility: visible;"></div>
                            <div id="tile-list-zone" style="display: block;" class="col-8">
                                {/* target of TileViewer */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
    )
}

async function displayOverlay() {
    console.log('overlay popping up')
    document.querySelector("#overlay").style.display = "block"
    document.querySelector("#tile-list-zone").style.display = "block"
}

async function hideOverlay() {
    document.querySelector("#overlay").style.display = "none"
    document.querySelector("#tile-list-zone").style.display = "none"
}
