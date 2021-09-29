import { Role, Selector } from 'testcafe';

const adminUser = Role('http://127.0.0.1:8080/', async t => {
    await t
    .typeText('#input-18', 'Admin')
    .typeText('#input-21', 'Admin')
    .click("#login-loginbutton")
});

fixture `Admin View Navigation`
    .page `http://127.0.0.1:8080/`;

test('Navigation Tabs', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-admin")
        .expect(Selector('#admin-page-products').innerText).eql('PRODUCTS')
        .expect(Selector('#admin-page-users').innerText).eql('USERS')
        .expect(Selector('#admin-page-warehouse').innerText).eql('WAREHOUSE');

});

test('Products Tab', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-admin")
        .click("#admin-page-products")

});

test('Users Tab', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-admin")
        .click("#admin-page-users")

});

test('Warehouse Tab', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-admin")
        .click("#admin-page-warehouse")

});

test('Constants Tab', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-admin")
        .click("#admin-page-constants")

});
