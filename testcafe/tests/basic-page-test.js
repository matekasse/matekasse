import { Role, Selector } from 'testcafe';

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

fixture `Admin-View`
    .page `http://127.0.0.1:8080/`;

test('Navigation Tabs', async t => {
    await t
        .useRole(adminUser)
        .navigateTo('/admin')
        .expect(Selector('#admin-page-products').innerText).eql('PRODUCTS')
        .expect(Selector('#admin-page-users').innerText).eql('USERS')
        .expect(Selector('#admin-page-warehouse').innerText).eql('WAREHOUSE');

});
