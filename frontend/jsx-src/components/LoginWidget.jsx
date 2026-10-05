import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { signal } from '@preact/signals'
import { colinHacksEmailRegex, $, range, delay } from '../../js/functionhider.js'

let loginResMessage = signal('')

export default function UserControl(props) {
    let [ signedIn, setSignedIn ] = useState(localStorage.getItem('signedIn'))

    if (signedIn) {
        return (
            <>
            <title>User</title>
            <div>
                <span>welcome {localStorage.getItem('username')}</span>
                <input type='button' value='logout' onClick={unsetJwt} />
                <span>maybe one day ill put awards or something here</span>
            </div>
            </>
        )
    } else {
        return (
            <>
            <title>User</title>
            <div>
                <input type='text' name='email' id='wLogin-email-box' />
                <label>email (i dont know how to email you yet, its just to make a unique db entry)</label>
            </div>
            <div>
                <input type='text' name='username' id='wLogin-username-box' />
                <label>username</label>
            </div>
            <div>
                <input type='text' name='password' id='wLogin-password-box' />
                <label>password</label>
            </div>
            <input type='button' name='login' value='login' onClick={login} />
            <input type='button' name='register' value='register' onClick={register} />
            <input type='button' name='test' value='test' onClick={verify} />
            <label id='wLoginResMessage' style='color: red;'>{loginResMessage}</label>
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
}

async function login() {
    let data = JSON.stringify({
        email: $('#wLogin-email-box').value,
        username: $('#wLogin-username-box').value,
        password: $('#wLogin-password-box').value
    })

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
        body: data
    })
    let login = await loginRes.json()
    console.log(login)
    localStorage.setItem('jwt', login.token)
    localStorage.setItem('username', login.username)
}

async function register() {
    let data = JSON.stringify({
        email: $('#wLogin-email-box').value,
        username: $('#wLogin-username-box').value,
        password: $('#wLogin-password-box').value
    })

    if (!checkData(data)) {
        return
    }

    $('#wLogin-password-box').style.border =
        $('#wLogin-username-box').style.border =
        $('#wLogin-email-box').style.border = ''


    console.log(data)
    let registerRes = await fetch('/api/registerUser', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: data
    })
    let registerJson = await registerRes.json()
    if (Object.hasOwn(registerJson, 'error')) {
        loginResMessage.value = registerJson.error
        return
    }

    localStorage.setItem('jwt', login.token)
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
    localStorage.setItem('jwt', null)
    localStorage.setItem('username', null)
}