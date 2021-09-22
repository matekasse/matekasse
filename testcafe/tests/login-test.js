import { Role, Selector } from 'testcafe';

fixture `Login Test`
    .page `http://127.0.0.1:8080/`;

test('Login', async t => {
    await t
        .typeText('#input-18', 'Admin')
        .typeText('#input-21', 'Admin')
        .click("#login-loginbutton")
});

const adminUser = Role('http://127.0.0.1:8080/', async t => {
    await t
    .typeText('#input-18', 'Admin')
    .typeText('#input-21', 'Admin')
    .click("#login-loginbutton")
});

fixture `Home-View`
    .page `http://127.0.0.1:8080/`;

test('Balance', async t => {
    await t
        .useRole(adminUser)
        .expect(Selector('#home-view-balance').innerText).eql('Balance: 0.00 €');
});
