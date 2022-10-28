# Contributing to StackGen

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase (we use
[Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the Apache License 2.0 Software License

In short, when you submit code changes, your submissions are understood to be under the same
[Apache 2.0 License](https://choosealicense.com/licenses/apache-2.0/) that covers the project. Feel free to
contact the maintainers if that's a concern.

## Use a Consistent Coding Style

Code style strictly enforced via eslint and prettier.

## Design Considerations

StackGen is designed around small, yet powerful construct libraries. You should make careful consideration of the package
you select the new functionality to live in. Try not to create additional packages unless needed. For example:

- An AWS CDK construct library should live in packages/cdk
- An opinionated library should live in another project

This library has been designed around Yarn 3 and implements several of the core ideas of this projects inspriration,
Projen.
