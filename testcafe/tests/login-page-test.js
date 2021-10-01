import { Selector } from 'testcafe';

fixture `Login Page Test`
    .page `http://127.0.0.1:8080/`;

test('Login Page Buttons', async t => {
    await t
        .expect(Selector('#login-loginbutton').innerText).eql('LOGIN')
        .expect(Selector('#login-registerbutton').innerText).eql('GO TO REGISTER');
    });

test('Login', async t => {
    await t
        .typeText('#input-18', 'Admin')
        .typeText('#input-21', 'Admin')
        .click("#login-loginbutton")
});
