import { useRoute } from 'preact-iso'
import { useState, useEffect } from 'preact/hooks'
import '../styles/topMenuBar.scss'

import icon from '../img/favicon25.ico'

function MenuItem(props) {
    return (
        <>
        <img src={props.item.image} class='menu-image' />
        <div class='menu-item'>
            <a href={props.item.link}>{props.item.text}</a>
        </div>
        </>
    )
}

export default function TopMenuBar(props) {
    let [ menuItems, setMenuItems ] = useState([])
    // console.log(useRoute().path)

    useEffect(async () => {
        let labels = []
        labels.push({text: 'Bingo', link: '/', image: icon})
        labels.push({text: 'Nominees', link: '/nominees', image: icon})
        labels.push({text: 'Account', link: '/accounts', image: icon})
        labels.push({text: 'Home', link: '/', image: icon})
        setMenuItems(labels)
        labels = []
        labels.push({text: 'Bingo', link: '/', image: icon})
        labels.push({text: 'Nominees', link: '/nominees', image: icon})
        if (localStorage.getItem('jwt') != null) {
            console.log('the top menu bar is up to no good')
            let activeTokenRes = await fetch('/api/verifyTokenActive', {
                method: 'post',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ 'username': localStorage.getItem('username'), 'token': localStorage.getItem('jwt') })
            })
            let activeToken = await activeTokenRes.text()
            console.log('at', activeToken)
            if (activeToken) {
                console.log('still logged in')
                // localStorage.setItem('signedIn', true)
                labels.push({text: localStorage.getItem('username'), link: '/accounts', image: icon})
            } else {
                labels.push({text: 'Account', link: '/accounts', image: icon})
            }
        } else {
            labels.push({text: 'Account', link: '/accounts', image: icon})
        }
        labels.push({text: 'Home', link: '/', image: icon})
        setMenuItems(labels)
    }, [])

    return (
        <>
        <div id='header-menu' class='row'>
            <div id='header-menu-items'>
                {menuItems.map((item) =>
                    <MenuItem item={item}/>
                )}
            </div>
        </div>
        </>
    )
}