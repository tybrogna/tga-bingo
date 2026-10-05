import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { $, range, delay } from '../../js/functionhider.js'

import TopMenuBar from './TopMenuBar.jsx'
import LoginWidget from '../components/LoginWidget.jsx'

import '../styles/userControl.scss'

let token

export default function UserControl(props) {
    return (
        <>
        <title>User</title>
        <div id="main" className="container widener">
            <div id="content" className="shell pl-5 pr-5">
                <TopMenuBar />
                <LoginWidget />
            </div>
        </div>
        </>
    )
}

// async function login() {
//     let data = JSON.stringify({
//         email: $('#email-box').value,
//         username: $('#username-box').value,
//         password: $('#password-box').value
//     })
//     let loginRes = await fetch('/api/testlogin', {
//         method: 'post',
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: data
//     })
//     let login = await loginRes.json()
//     localStorage.setItem('jwt', login.token)
//     localStorage.setItem('username', login.user)
// }

// async function register() {
//     let data = JSON.stringify({
//         email: $('#email-box').value,
//         username: $('#username-box').value,
//         password: $('#password-box').value
//     })
//     console.log(data)
//     let registerRes = await fetch('/api/testadduser', {
//         method: 'post',
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: data
//     })
//     console.log(await registerRes.json())
// }

// async function verify() {
//     let verifyRes = await fetch('/api/testtoken', {
//         method: 'post',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             'token': localStorage.getItem('jwt')
//         })
//     })
// }