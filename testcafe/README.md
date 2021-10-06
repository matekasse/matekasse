## Testcafe

Some integration tests with testcafe.

For local usage start database, backend and frontend like described in the development section and use:

```sh
	yarn testcafe firefox tests
```
Firefox can be replaced by other browsers.

Use
```sh
	yarn testcafe "firefox:headless" tests
```
For headless testing.
