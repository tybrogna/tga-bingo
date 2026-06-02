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

export function BingoSkeleton(props) {
    return (
    <>
    <title>TGA Bingo: Tile View</title>
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



<div id="tile-list-zone" style="display: block;" class="col-8">
    {/* target of TileViewer */}
</div>
