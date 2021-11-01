import { Role, Selector } from 'testcafe';

const adminUser = Role('http://127.0.0.1:8080/', async t => {
    await t
    .typeText('#input-18', 'Admin')
    .typeText('#input-21', 'Admin')
    .click("#login-loginbutton")
});

const adminUserAlternative = Role('http://127.0.0.1:8080/', async t => {
    await t
    .typeText('#input-18', 'Admin')
    .typeText('#input-21', 'Admin123')
    .click("#login-loginbutton")
});

fixture `Profile View`
    .page `http://127.0.0.1:8080/`;

test('Username', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-profile")
        .expect(Selector('#profile-view-username-field').innerText).eql('Username: Admin')

});

test('Change password', async t => {
    await t
        .useRole(adminUser)
        .click("#burger-menue-profile")
        .click("#profile-change-password")
        .typeText('#change-password-modal-old-password', 'Admin')
        .typeText('#change-password-modal-new-password', 'Admin')
        .typeText('#change-password-modal-new-password-repeat', 'Admin')
        .click("#change-password-modal-change-password")
});
