import { $ } from "../js/functionhider"
import { render } from 'preact'

function Test() {

    const callForServer = async () => {
        let hwRes = await fetch('/api/helloworld')
        console.log(hwRes)
        let hwJson = await hwRes.text()
        console.log(hwJson)
        $('p').innerHTML = hwJson
    }

    return (
        <>
        <input type="button" value="push for server shit" onClick={callForServer}/>
        <p>TGA DOT ZONE</p>
        <link rel="icon" href="../img/favicon25.ico" />
        </>
    )
}

export default function() {
    render(<Test />, document.body)
}
