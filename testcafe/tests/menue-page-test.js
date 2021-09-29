import { Role, Selector } from 'testcafe';

const adminUser = Role('http://127.0.0.1:8080/', async t => {
    await t
    .typeText('#input-18', 'Admin')
    .typeText('#input-21', 'Admin')
    .click("#login-loginbutton")
});

fixture `Menu View`
    .page `http://127.0.0.1:8080/`;

test('Balance', async t => {
    await t
        .useRole(adminUser)
        .expect(Selector('#home-view-balance').innerText).eql('Balance: 0.00 €');
});
