import { render } from 'preact'
import { useState, useCallback, useEffect } from 'preact/hooks'
import { $, range, delay, objectSort } from '/js/functionhider.js'

import '../styles/dbView.scss'

async function renderPage() {
    if (storedPassword) {
        console.log("yeah")
        let fetchedRows = await fetch(`/api/dbAccess/${storedPassword}/getTables`)
        let rowsJson = await fetchedRows.json()
        // console.log(rowsJson)
        let rows = rowsJson.map(r => r['tablename'])
        // console.log(rows)
        render(DbViewSkeleton(rows), document.querySelector('body'))
    } else {
        return 
    }
}

function DbViewSkeleton(props) {
    console.log("rendering skeleton")
    const [ password, setPassword ] = useState('')

    let storedPassword = localStorage.getItem('dbViewPassword')
    let storedExpiration = localStorage.getItem('dbViewPasswordExpiration')
    console.log(storedPassword)
    console.log(storedExpiration)

    if (storedPassword != null && storedExpiration != null && storedExpiration >= Date.now()) {
        return RealDBViewManager(storedPassword)
    } else {
        let confirmPassword = async (event) => {
            let password = $('#pwBox').value
            let res = await fetch(`/api/dbAccess/${password}`)
            console.log(res.status)
            if (res.status == 200) {
                res = await res.json()
                console.log(res)
                localStorage.setItem('dbViewPassword', res.token)
                localStorage.setItem('dbViewPasswordExpiration', res.expiresAt)
                setPassword(res.token)
            }
        }

        return (
            <>
            <title>TGABingo // DB View</title>
            <link rel="icon" href="/img/favicon24.ico" />
            <div id="main" className="container widener">
                <div id="content" className="shell pl-5 pr-5">
                    <input id="pwBox" type="password" placeholder="password..." />
                    <input type="button" value="Get" onClick={confirmPassword} />
                </div>
            </div>
            </>
        )
    }
}

function RealDBViewManager(key) {
    console.log(key)
    const [ hii, setHii ] = useState([])

    useEffect(async () => {
        console.log("skeleton effect, should only happen once")
        let fetchedRows = await fetch(`/api/dbAccess/${key}/getTables`)
        let rowsJson = await fetchedRows.json()
        let rows = rowsJson.map(r => r['tablename'])
        // console.log(rows)
        setHii([...hii, ...rows])
    }, [])

    const [ selectedTable, setSelectedTable ] = useState('')
    const [ offset, setOffset ] = useState(0)

    let tableSelectEvent = (event) => {
        console.log('i selected a table, its ' + event.currentTarget.value)
        setSelectedTable(event.currentTarget.value)
        setOffset(offset)
    }

    let tableOptions = hii.map(row => {
        return <option value={row}>{row}</option>
    })

    return (
    <>
    <title>TGABingo // DB View</title>
    <link rel="icon" href="/img/favicon24.ico" />
    <div id="main" className="container widener">
        <div id="content" className="shell pl-5 pr-5">
            <h2 id="event-title" className="text-center">
                VIEW DB TILES
            </h2>
            <select name="tables" id="table-select" onChange={tableSelectEvent}>
                <option value="" selected></option>
                {tableOptions}
            </select>

            {/* <DBViewManager tables={props} /> */}
            <DBTable items={{"key": key, "table":selectedTable, "offset":offset}}/>
            {/* <DBViewManager tables={props} /> */}
        </div>
    </div>
    </>
    )
}

function DBViewManager(props) {
    console.log("vmprops", props)
    const [ selectedTable, setSelectedTable ] = useState('')
    const [ offset, setOffset ] = useState(0)

    let tableSelectEvent = (event) => {
        console.log('i selected a table, its ' + event.currentTarget.value)
        setSelectedTable(event.currentTarget.value)
        setOffset(offset)
    }

    let tableOptions = props.tables.map(row => {
        return (
        <>
            <option value={row}>{row}</option>
        </>
        )
    })

    let sortTarget = ""
    let leftmost = []

    // useEffect(async () => {
    //     console.log("effect triggered, i see " + selectedTable)
    //     if (selectedTable == '')
    //         return
    //     let fetchedRows = await fetch(`/api/get100Rows/${selectedTable}/${offset}`)
    //     let rows = await fetchedRows.json()
    //     console.log(rows)
    //     if (sortTarget != "" && rows[0][sortTarget] != undefined) {
    //         objectSort(rows, sortTarget)
    //     }

    //     rows.forEach(item => {
    //         let leftmostItems = Object.entries(item).filter(([k,v]) => leftmost.includes(k))
    //         let theRest = Object.entries(item).filter(([k,v]) => !leftmost.includes(k))
    //         console.log(leftmostItems)
    //         console.log(theRest)
    //     })
    // })

    return (
    <>
        <select name="tables" id="table-select" onChange={tableSelectEvent}>
            <option value="" selected></option>
            {tableOptions}
        </select>
        <div class="row">
            <input id="first-page" type="button" value="<<<" />
            <input id="prev-page" type="button" value="<" />
            <input id="page-indicator" type='text' value="" />
            <input id="prev-page" type="button" value=">" />
            <input id="prev-page" type="button" value=">>>" />
        </div>
        <DBTable items={{"table":selectedTable, "offset":offset}}/>
    </>
    )
}

function DBTable(props) {
    console.log("dbtable props ", props)
    let {key, table, offset} = props.items
    // const [ currRows, setCurrRows ] = useState([])
    const [ tableRows, setTableRows ] = useState([])

    useEffect(async () => {
            if (table == '')
                return
            let tableDataJson = await fetch(`/api/dbAccess/${key}/get100Rows/${table}/${offset}`)
            let tableData = await tableDataJson.json()
            console.log("i called for table rows, theyre ", tableData)
            setTableRows(tableData)
    }, [table, offset])

    // setTRows(firstItems.length + items.length)

    // let tHeader = range()

    // let tableRowsHtml = range(tableRows.length).map(num => {
    //     return (
    //         <>
    //         <DBTableRow data={"r"+num}/>
    //         </>
    //     )
    // })

    return (
        <>
        {/* <input type="button" value="more rows" onClick={() => setTRows(tRows +1) }/> */}
        <table>
            <thead>
                start
            </thead>
            <DBTableRows items={tableRows} />
            <tfoot>
                end
            </tfoot>
        </table>
        </>
    )
}

function DBTableRows(props) {
    console.log("these are teh rows that were sent to render", props)
}

function DBTableRow(props) {
    const [ tData, setTData ] = useState(1)
    
    let tableData = range(tData).map(num => {
        return (
            <>
            <td>{props.data + "d" + num}</td>
            </>
        )
    })

    return (
        <>
        <tr>
            {tableData}
            <td>
                <input type="button" value="more data" onclick={() => setTData(tData+1)}/>
            </td>
        </tr>
        </>
    )
}

export default function() {
    render(DbViewSkeleton(), document.querySelector('body'))
}
