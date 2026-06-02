

function Home() {
    return (
        <>
        <title>TGA DOT ZONE</title>
        <link rel="icon" href="../img/favicon25.ico" />
        <TopMenuBar />
        <div id="main" className="container widener">
            <div id="content" className="shell pl-5 pr-5">
                <a href='/bingo/current'>PLAY BINGO (current: TGA 2025)</a>
                <a href='/bingo/tga/2024'>PREVIOUS CARDS</a>
                <a href='/newtile'>SUBMIT NEW TILE</a>
                <a href='/nominees'>GUESS NOMINEES</a>
                <a href='/gamelist'>LIST OF GAMES</a>
            </div>
        </div>
        </>
    )
}

export default function() {
    render(<Home />, document.body)
}