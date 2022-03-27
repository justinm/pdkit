## @pdkit/nodejs [1.0.4](https://github.com/justinm/pdkit/compare/@pdkit/nodejs@1.0.3...@pdkit/nodejs@1.0.4) (2022-03-27)


### Bug Fixes

* run pdkit synth from top-level ([64e0dc3](https://github.com/justinm/pdkit/commit/64e0dc3b396a6a0eb86ae2613b2edfb7fbcd58b5))

## @pdkit/nodejs [1.0.3](https://github.com/justinm/pdkit/compare/@pdkit/nodejs@1.0.2...@pdkit/nodejs@1.0.3) (2022-03-27)


### Bug Fixes

* add new step to authenticate yarn 2 ([b86f4d2](https://github.com/justinm/pdkit/commit/b86f4d222de23d97c93864c5bb7954133e8d52e1))
* package versions from bad release build ([819f31b](https://github.com/justinm/pdkit/commit/819f31b3a0c4816ba9ed4d9e4e450dae954d98f3))
* provide registryUrl for authenticating Yarn for publishing ([bcd1d8f](https://github.com/justinm/pdkit/commit/bcd1d8f5f7f3905e442c511e4a432735cea21a5b))
* read path to project package.json file ([0ad8b5a](https://github.com/justinm/pdkit/commit/0ad8b5ad42accf0ecac6cd8e1e1bb4418e32e547))
* resynth after version bump to ensure correct yarn.lock and package mods ([2c79117](https://github.com/justinm/pdkit/commit/2c791179ec89b4aabeb78f7680af68cecb8633fe))
* synth during yarn/npm release ([fa7201b](https://github.com/justinm/pdkit/commit/fa7201b4e075c283e2188a32678750914ebaac73))

## @pdkit/nodejs [1.0.2](https://github.com/justinm/pdkit/compare/@pdkit/nodejs@1.0.1...@pdkit/nodejs@1.0.2) (2022-03-27)


### Bug Fixes

* setup node with proper tool ([d132f17](https://github.com/justinm/pdkit/commit/d132f1733490b7d4d04d8c1f05aedb859379557e))





### Dependencies

* **@pdkit/core:** upgraded to 1.0.3

## @pdkit/nodejs [1.0.1](https://github.com/justinm/pdkit/compare/@pdkit/nodejs@1.0.0...@pdkit/nodejs@1.0.1) (2022-03-27)


### Bug Fixes

* cli bin not creating in release and switch to using workspaces ([6cac682](https://github.com/justinm/pdkit/commit/6cac682160f2678ffff0f9b4c956a7d78cf3aade))
* different release steps for npm vs yarn ([75d8b26](https://github.com/justinm/pdkit/commit/75d8b26cc5ab73de941a97220821de0a0f53a9e1))
* do not autobump dependencies as we rely on workspace links ([cf1c782](https://github.com/justinm/pdkit/commit/cf1c782a465bfda11de85ec21a1d59861b7cc16b))
* proper quotes for yarn auth ([57ff96c](https://github.com/justinm/pdkit/commit/57ff96cd89013bdeb89069394bf814a1cc446630))

# @pdkit/nodejs 1.0.0 (2022-03-27)


### Bug Fixes

* addressing several issues with merging json data ([7a97f90](https://github.com/justinm/pdkit/commit/7a97f900655df436859e80163c96330a8b947e22))
* appendable files ([439c9b7](https://github.com/justinm/pdkit/commit/439c9b70b2952298f82a67aaf38fd44c6bbf42f5))
* cleaning up spider web of construct intra-dependencies ([aaf1ad7](https://github.com/justinm/pdkit/commit/aaf1ad701a984018b515b15b0db54f531c2f34f1))
* eslint + typescript extensions ([9fca14f](https://github.com/justinm/pdkit/commit/9fca14fdfdb5aefb4d5c11be15b3fa3d6d507c30))
* fix package.json licensing ([f1caf6b](https://github.com/justinm/pdkit/commit/f1caf6b7ed638597212cd98f1609fc7792155e62))
* initial support for licenses ([971c699](https://github.com/justinm/pdkit/commit/971c699cd5b12b45639b5aa3f1039f829d3dacbd))
* package version patching ([bcc5854](https://github.com/justinm/pdkit/commit/bcc5854ac540faea9099f4517718c3a6444c3c3a))
* releases ([125b154](https://github.com/justinm/pdkit/commit/125b1540720b203d1b8e0c7acb28cb1b47f05862))
* tasks overhaul again ([d984d63](https://github.com/justinm/pdkit/commit/d984d630bb31a0b5ee2d40bb6e7b4a5d260a2eb9))


### Features

* add github cache support and yarn clean ([f28f518](https://github.com/justinm/pdkit/commit/f28f5183f706953cfbe961dd558e3f783e55fd5d))
* adding eslint/prettier support ([6bce65c](https://github.com/justinm/pdkit/commit/6bce65c3cccde4226c2cfd73efa09d961c17c292))
* adding pr validation and pr template support ([9e7020e](https://github.com/justinm/pdkit/commit/9e7020e35c9e111a55a8b1b92e5b88fc425d6717))
* adding support for jest ([ed0b293](https://github.com/justinm/pdkit/commit/ed0b293fa9b4470c04658aa6b4748bbe82492f29))
* additional gitignore ([2477a4d](https://github.com/justinm/pdkit/commit/2477a4d01c9ebe7667a5a0f3accb22f08ba6ba55))
* adds task support ([a32d404](https://github.com/justinm/pdkit/commit/a32d404b0c8a4ef15a2a7d810a8e53bc5982d133))
* allow inheritance of manifest entries, ie Author ([9ab03a6](https://github.com/justinm/pdkit/commit/9ab03a6aae6c2470cdfd6a9dd5d6360541ce95fd))
* better dependency management support ([0e9626d](https://github.com/justinm/pdkit/commit/0e9626decdf76de3a451f06dc0dced8cce1f0002))
* cleanup and inheritable licenses ([afd38cc](https://github.com/justinm/pdkit/commit/afd38ccb1d571fe93b4444f4a5f86fb73f7355fa))
* cli task support ([f02dbbe](https://github.com/justinm/pdkit/commit/f02dbbeb6f6ee87efb14e5dc2615652d58546364))
* github workflows ([648a591](https://github.com/justinm/pdkit/commit/648a5914f22236c6e2a31b62741c16486a66abba))
* initial attempt at basic runnable tasks ([766e6f8](https://github.com/justinm/pdkit/commit/766e6f81ac67ad3d6a28456ffef6d4e1e0833a86))
* initial support for licenses ([bbeaa7b](https://github.com/justinm/pdkit/commit/bbeaa7b948ee8b5ad0c80f41c8232279930b152d))
* initial yarn 2 monorepo construct ([17a60e9](https://github.com/justinm/pdkit/commit/17a60e974c34856af3bb287b067546f4807f525b))
* merge some current package.json values into generated ([0a6fd7c](https://github.com/justinm/pdkit/commit/0a6fd7cff478f24c126b410a6818fde3e036b8f3))
* node package dependencies ([305294a](https://github.com/justinm/pdkit/commit/305294a33832a3398cf1bfea5c1a281867ccdc96))
* patch package.json post install ([68b63ce](https://github.com/justinm/pdkit/commit/68b63ce4436816bc7e742ec2068a3c468edb2819))
* semantic release support ([b03e876](https://github.com/justinm/pdkit/commit/b03e876f068298074bfff72d853d0e549b727c3e))
* support post synth commands (ie run yarn after synth) ([a627269](https://github.com/justinm/pdkit/commit/a627269cc77f2abc8f76c08cb189edf09d8887c7))





### Dependencies

* **@pdkit/core:** upgraded to 1.0.0
