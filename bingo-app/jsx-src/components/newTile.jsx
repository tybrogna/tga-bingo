import { render } from 'preact'
import { useState } from 'preact/hooks'
import { $, range } from '../js/functionhider.js'
import { Cropt } from 'cropt'

import '../styles/newTile.scss'
import { useEffect } from 'react'

let croptBoxes = [null, null, null, null]
let croptOptions = [null, null, null, null]
croptOptions[1] = {
    viewport: {
        width:400,
        height:400
    },
    showZoomer: true
}
croptOptions[2] = {
    viewport: {
        width:350,
        height:350
    },
    showZoomer: true
}
croptOptions[3] = {
    viewport: {
        width:300,
        height:300
    },
    showZoomer: true
}

function picUploaderClasses(numCols) {
    let retVal = ''
    retVal += 'col-' + 12 / numCols
    retVal += ' drop-' + numCols + '-col'
    return retVal
}

function textUploaderClasses(numCols) {
    let retVal = ''
    retVal += 'col-' + 12 / numCols
    retVal += ' text-' + numCols + '-col'
    return retVal
}

function NewTileContent(props) {
    const [ val, setVal ] = useState('')
    if (!val) { setVal("1") }

    useEffect(() => {
        // after page is (re)rendered, make one, two, or three cropt boxes
        // and since there's so few paths, this is more readable than a loop
        croptBoxes[1] = new Cropt($('#preview-box-1'), croptOptions[val])
        if (val == 2) {
            croptBoxes[2] = new Cropt($('#preview-box-2'), croptOptions[val])
        } else if (val == 3) {
            croptBoxes[2] = new Cropt($('#preview-box-2'), croptOptions[val])
            croptBoxes[3] = new Cropt($('#preview-box-3'), croptOptions[val])
        }
    })

    let picUploaderCode =
        range(val).map(id => {
                return (
                <>
                    <PictureUploader items={{'id':id, 'numCols':val}}/>
                </>
                )
            })
    
    let textUploadCode =
        range(val).map(id => {
                return (
                <>
                    <TextUploader items={{'id':id, 'numCols':val}}/>
                </>
                )
            })
    
    return (
    <>
    <div id="options-area">
        <label class='pr-1'>Event </label>
        <select name="events" id="event-select">
            <option value="__default">-</option>
            <option value="sfg2025">Summer Games Fest 2025</option>
        </select>
        <label class="pl-4 pr-1">Mutually-Exclusive Combos <a class="help-link" onClick={activateOverlay}><sup><u>?</u></sup></a> </label>
        <select name="combos" id="combo-select" onChange={event => { resetAllImages(); setVal(event.currentTarget.value);} }>
            <option value="1" selected>1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
        <br />
        <div id='pic-uploader-row' class='row'>
            {picUploaderCode}
        </div>
        <br/>
        <br/>
        <br/>
        <div id='text-uploader-row' class='row'>
            {textUploadCode}
            <div class='input-field'>
                <input class='mr-3' type='text' id='submit-code' placeholder='required upload code' />
                <input type='button' id='submit-button' value='Upload for Approval' onClick={submitForApproval}/>
            </div>
        </div>
    </div>
    </>
    )
}

function PictureUploader(props) {
    let { id, numCols } = props.items

    return (
    <>
    <div id={'pic-uploader-' + id} class={picUploaderClasses(numCols)}>
        <div id={'drop-area-' + id} class='input-field w-inherit h-inherit'
        onDragOver={imgDragOver}
        onDragLeave={imgDragLeave}
        onDrop={handleFile}
        onClick={(e) => clickFileInput(e, id)}>
            <input type='file' id={'file-input-' + id} onChange={clickFileUpload}/>
            <div id={'preview-box-' + id} class={'preview-box-' + numCols + '-col' }>
                {/* <img id={'preview-zone-' + id} class='preview-image' /> */}
            </div>
            <div id={'drop-text-' + id} class='pic-info-padding'>
                Drop image here, or click to upload...
            </div>
            <div id={'url-text-area-' + id} class='pic-info-padding'>
                <input type='text' id={'url-textbox-' + id} placeholder='https://url.to/img' onChange={handleUrl}/>
                <input type='button' id={'url-submit-' + id} value='Submit' />
            </div>
        </div>
        <div class='reset-button-container'>
            <input type='button' id={'reset-button-' + id} value='Reset Image' onClick={unhandleImage} />
        </div>
    </div>
    </>
    )

}

function TextUploader(props) {
    let { id, numCols } = props.items

    return (
    <>
    <div id={'text-uploader-' + id} class={textUploaderClasses(numCols)}>
        <div class='input-field w-inherit'>
            <div>Display Text</div>
            <textarea id={'display-text-input-' + id} placeholder='Required'/>
        </div>
        <br />
        <div class='input-field'>
            <div>Description</div>
            <textarea id={'desc-text-input-' + id} />
        </div>
        <br />
    </div>
    </>
    )
}

function Overlay() {
    return (
        <>
        <div id='overlay' onClick={disableOverlay}>
            <div id='overlay-text-box'>
                <img id='overlay-image' />
                Some bingo boxes have mutually exclusive events ("X game wins" vs "Y game wins").
                <br />
                In that case, you can submit multiple tiles (up to three) that can't appear on the same board with each other.
            </div>
        </div>
        </>
    )
}

function resetAllImages() {
    for (let index = 1; index < croptBoxes.length; index ++) {
        if (croptBoxes[index] != null) {
            console.log('destroying box ' + index)
            croptBoxes[index].destroy()
            unhandleImage($('#reset-button-' + index))
            croptBoxes[index] = null
        }
    }
}

function NewTileSkeleton(props) {
    return (
    <>
    <title>TGABingo // New Tile</title>
    <link rel="icon" href="/img/favicon24.ico" />
    <div id="main" className="container widener">
        <div id="content" className="shell pl-5 pr-5">
            <h2 id="event-title" className="text-center">
                CREATE NEW TILE
            </h2>
            <NewTileContent />
            <Overlay />
        </div>
    </div>
    </>
    )
}

function imgDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    event.target.closest('[id^=\'drop-area-\']').classList.add('drag-over')
}

function imgDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    event.target.closest('[id^=\'drop-area-\']').classList.remove('drag-over')
}

/**
 * The event listener is on the whole upload area, it redirects a click to the hidden file input element.
 * Do nothing if:
 *   you click the text input, submit button, or reset button.
 *   there already is a cropt box for this area.
 */
function clickFileInput(event, id) {
    let eventTarget = event.target

    if (eventTarget.id.startsWith('url-textbox') &&
            eventTarget.id.startsWith('url-submit') &&
            eventTarget.id.startsWith('reset-button')) {
        return
    }

    while (!eventTarget.id.startsWith('drop-area')) {
        eventTarget = eventTarget.parentElement
    }

    if (croptBoxes[id] != null) {
        return
    }

    eventTarget.querySelector('[id^=\'file-input\']').click()
}

function clickFileUpload(uploadEvent) {
    if (uploadEvent.target.files.length > 1) {
        displayWarning("Too many files")
        return
    }
    displayFileInPreview(uploadEvent.target.files, uploadEvent.target)
}


function handleUrl(event) {
    try {
        let url = new URL(event.target.value);
    } catch (_) {
        displayWarning("Not a URL")
        return
    }

    // TODO: this dont work
    displayFileInPreview(url, event.target.value)
}

function handleFile(dropEvent) {
    console.log(dropEvent)
    dropEvent.preventDefault()
    if (dropEvent.dataTransfer.files.length > 1) {
        displayWarning(dropEvent.target, "Too many files")
        return
    }

    let fileIn = dropEvent.dataTransfer.files
    
    displayFileInPreview(fileIn, dropEvent.target)
}

function displayFileInPreview(fileList, previewLoc) {
    if (!isAPicture(fileList[0])) {
        displayWarning(previewLoc, "That file isn't a png or jpg")
        return
    }

    if (fileList[0].size >= 4999999) {
        displayWarning(previewLoc, "Too big, keep it under 5 MB")
        return
    }

    let reader = new FileReader()
    reader.readAsDataURL(fileList[0])
    reader.onloadend = (loadedEvent) => {
        let zone = previewLoc.closest("[id^=pic-uploader]")

        zone.querySelector('[id^=file-input]').files = fileList
        zone.querySelector('[id^=drop-text]').innerHTML = ""
        zone.querySelector('[id^=drop-text]').style.display = "none"
        let relevantId = zone.id.substring(zone.id.lastIndexOf('-') + 1, zone.id.length)
        console.log(relevantId)
        console.log(croptBoxes[relevantId])
        croptBoxes[relevantId].bind(loadedEvent.target.result)
        zone.querySelector('[id^=preview-box]').style.display = "block"
        zone.querySelector('[id^=drop-area]').style.border = "none"
        zone.querySelector('[id^=url-text-area]').style.display = "none"
    }
}

function isAPicture(file) {
    return ['image/jpeg', 'image/png'].includes(file.type)
}

function unhandleImage(event) {
    let loc = event
    if (event.target) {
        loc = event.target
    }
    let zone = loc.closest("[id^=pic-uploader]")
    if (zone.src == "") {  // theres no image there
        return
    }
    zone.querySelector("[id^=drop-text]").innerHTML = "Drop image here, or click to upload..."
    zone.querySelector('[id^=drop-text]').style.display = "block"
    zone.querySelector("[id^=preview-box]").style.display = "none"
    zone.querySelector('[id^=drop-area]').style.border = "2px dashed #cfb4ed"
    zone.querySelector('[id^=drop-area]').classList.remove('drag-over')
    zone.querySelector('[id^=url-text-area]').style.display = "block"

}


function displayWarning(eventTarget, text = "something went wrong...I'm not sure what") {
    while (!eventTarget.id.startsWith('drop-area')) {
        eventTarget = eventTarget.parentElement
    }
    eventTarget.classList.remove('drag-over')
    let target = eventTarget.querySelector('[id^=\'drop-text\']')
    target.innerHTML = text
    if (target.classList.contains('warning')) {
        target.style.animation = 'none'
        target.offsetHeight;
        target.style.animation = null;
    } else {
        target.classList.add("warning")
    }
}

async function submitForApproval() {
    //TODO in order
    //  set up submitter id somehow
    //    don't bother with passwords, just use email key
    //  Destroy Quality (might have to be done serverside?)
    //  split into three

    let uploadJson = await getUploadJsonOnce()
    console.log(uploadJson)
    console.log(uploadJson.items)
    console.log(uploadJson.items[0])
    console.log(uploadJson.items[0].image)
    $('#overlay-image').src = uploadJson.items[0].image.toDataURL()
    activateOverlay()


    // let res = await fetch('/SubmitTile', {
    //     method: 'post',
    //     headers: {
    //         //this is fucking required it took entirely too long to figure out
    //         'content-type': 'application/json'
    //     },
    //     body: JSON.stringify(uploadJson)
    // })
}

async function getUploadJsonOnce() {
    let uploadJson = {
        event: document.querySelector('#event-select').value,
        combo: document.querySelector('#combo-select').value,
        items: []
    }

    croptBoxes.forEach(async box => {
        if (!box) { return }

        let res = await box.toCanvas(400)
        if (!res) { return }
        
        uploadJson.items.push({
            image: res,
            title: document.querySelector('#display-text-input-1').value,
            descrpition: document.querySelector('#desc-text-input-1').value,
            submitter: 'test@qa.com'
        })
    }) 

    // res = await getUploadJson(croppieBoxes[2])
    // if (res) {
    //     uploadJson.items.push(res)
    // }

    // res = await getUploadJson(croppieBoxes[3])
    // if (res) {
    //     uploadJson.items.push(res)
    // }

    return uploadJson
}

function activateOverlay() {
  document.getElementById("overlay").style.display = "block";
}

function disableOverlay() {
  document.getElementById("overlay").style.display = "none";
}

export default function() {
    render(NewTileSkeleton(), document.querySelector('body'))
    $('#options-area').style.display = 'block' 
}