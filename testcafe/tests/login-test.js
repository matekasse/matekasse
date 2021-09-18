/* eslint-disable */
import { Selector } from 'testcafe';

fixture `Login Test`
    .page `http://127.0.0.1:8080/`;

test('Login', async t => {
    await t
        .typeText('#input-18', 'Admin')
        .typeText('#input-21', 'Admin')
});
