import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { signal } from '@preact/signals'
import { colinHacksEmailRegex, $, range, delay } from '../../js/functionhider.js'

import '../styles/login.scss'

let loginResMessage = signal('')
let signedIn = signal(false)

export default function UserControl(props) {

    useEffect(() => {
        signedIn.value = localStorage.getItem('jwt') != null
    })

    if (signedIn.value) {
        console.log(signedIn)
        return (
            <>
            <title>User</title>
            <div class='logged-in'>
                <span class='welcome'>welcome {localStorage.getItem('username')}</span>
                <div>
                    <input type='button' value='logout' onClick={unsetJwt} />
                </div>
                <span>maybe one day ill put awards or something here</span>
            </div>
            </>
        )
    } else {
        return (
            <>
            <title>User</title>
            <div class='logged-in'>
                <label>email (i dont know how to email you yet, its just to make a unique db entry)</label>
                <div class='field-spacer-bottom'>
                    <input type='text' name='email' id='wLogin-email-box' />
                </div>
                <label>username</label>
                <div class='field-spacer-bottom'>
                    <input type='text' name='username' id='wLogin-username-box' />
                </div>
                <label>password</label>
                <div class='field-spacer-bottom'>
                    <input type='text' name='password' id='wLogin-password-box' />
                </div>
                <div>
                    <input class='button-spacer-right' type='button' name='login' value='login' onClick={login} />
                    <input class='button-spacer-right' type='button' name='register' value='register' onClick={register} />
                    {/* <input class='button-spacer-right' type='button' name='test' value='test' onClick={verify} /> */}
                </div>
                <label id='wLoginResMessage' style='color: red;'>{loginResMessage}</label>
            </div>
            </>
        )
    }
}

function checkData(packet) {
    if (packet.email == "") {
        $('#wLogin-email-box').style.border = 'red 1px solid'
        return false
    }
    if (packet.username == "") {
        $('#wLogin-username-box').style.border = 'red 1px solid'
        return false
    }
    if (packet.password == "") {
        $('#wLogin-password-box').style.border = 'red 1px solid'
        return false
    }
    
    if (!colinHacksEmailRegex(packet.email)) {
        $('#wLogin-email-box').style.border = 'red 1px solid'
        return false
    }
    return true
}

async function login() {
    let data = {
        email: $('#wLogin-email-box').value,
        username: $('#wLogin-username-box').value,
        password: $('#wLogin-password-box').value
    }

    if (!checkData(data)) {
        return
    }
    $('#wLogin-password-box').style.border =
        $('#wLogin-username-box').style.border =
        $('#wLogin-email-box').style.border = ''

    let loginRes = await fetch('/api/login', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    let login = await loginRes.json()
    console.log(login)
    localStorage.setItem('jwt', login.token)
    localStorage.setItem('id', login.id)
    localStorage.setItem('username', login.username)
}

async function register() {
    let data = {
        email: $('#wLogin-email-box').value,
        username: $('#wLogin-username-box').value,
        password: $('#wLogin-password-box').value
    }

    if (!checkData(data)) {
        return
    }

    $('#wLogin-password-box').style.border =
        $('#wLogin-username-box').style.border =
        $('#wLogin-email-box').style.border = ''


    let registerRes = await fetch('/api/registerUser', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    let registerJson = await registerRes.json()
    if (Object.hasOwn(registerJson, 'error')) {
        loginResMessage.value = registerJson.error
        return
    }

    localStorage.setItem('jwt', login.token)
    localStorage.setItem('id', login.id)
    localStorage.setItem('username', login.username)
    loginResMessage.value = `successfully registered ${login.username}. You're now logged in`
}

async function verify() {
    console.log(localStorage.getItem('jwt'))
    let verifyRes = await fetch('/api/verifyTokenActive', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'username': localStorage.getItem('username'),
            'token': localStorage.getItem('jwt')
        })
    })
    loginResMessage.value = 'verify clicked'
}

async function unsetJwt() {
    localStorage.removeItem('jwt')
    localStorage.removeItem('id')
    localStorage.removeItem('username')
    signedIn.value = false
}